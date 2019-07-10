const request = require('supertest');
const mongoose = require('mongoose');
const moment = require('moment');
const _ = require('lodash');
const { User } = require('../../models/user');
const { Cycle } = require('../../models/cycle');
const { Rental } = require('../../models/rental');

describe('/api/rentouts', () => {
  let server;
  let token;
  let timeToCollect;
  let cycle;
  let rental;
  let id;

  beforeEach(async () =>{
    server = require('../../index');

    token = new User({ isAdmin: true }).genAuthToken();

    timeToCollect = moment().toDate();

    cycle = new Cycle({
      model: 'ab',
      brand: { name: 'cd' },
      type: { name: 'ef' },
      size: 'LG',
      color: ['white'],
      numberInStock: 100,
      hourlyRentalRate: 10
    });
    await cycle.save();
    
    rental = new Rental({
      user: {
        _id: mongoose.Types.ObjectId(),
        username: '1234',
        phone: '123456'
      },
      cycle: _.pick(cycle, [
        '_id', 'model', 'brand', 'type', 'size', 'color', 'hourlyRentalRate'
      ]),
      timeOrdered: moment().add(-1, 'hours').toDate(),
      timeToCollect
    });

    await rental.save();

    id = rental._id;
  });
  afterEach(async () => {
    await server.close();
    await Rental.remove({});
    await Cycle.remove({});
  });

  describe('PUT /:id', () => {
    const execPut = () => {
      return request(server)
        .put('/api/rentouts/' + id)
        .set('x-auth-token', token);
    }

    it('should return 401 if user has not logged in.', async () => {
      token = '';
  
      const res = await execPut();
  
      expect(res.status).toBe(401);
    });

    it('should return 403 if user is not admin.', async () => {
      token = new User({ isAdmin: false }).genAuthToken();
  
      const res = await execPut();
  
      expect(res.status).toBe(403);
    });

    it('should return 400 if rental ID is invalid.', async () => {
      id = '1';
  
      const res = await execPut();
  
      expect(res.status).toBe(400);
    });    
  
    it('should return 404 if no rental is found for the ID.', async () => {
      id = mongoose.Types.ObjectId().toHexString();
  
      const res = await execPut();
  
      expect(res.status).toBe(404);
    });
  
    it('should return 400 if timeRentedOut is already set.', async () => {
      rental.timeRentedOut = new Date();
      await rental.save();
  
      const res = await execPut();
  
      expect(res.status).toBe(400);
    });
  
    it('should return 200 if request is valid.', async () => {
      const res = await execPut();
  
      expect(res.status).toBe(200);
    });
  
    it('should set timeRentedOut if request is valid.', async () => {
      await execPut();
  
      const result = await Rental.findById(rental._id);
      const diff = new Date() - result.timeRentedOut;
  
      expect(diff).toBeLessThan(10 * 1000);
    });
  
    it('should return a rental if request is valid.', async () => {
      const res = await execPut();
  
      expect(Object.keys(res.body)).toEqual(expect.arrayContaining([
        'user', 'cycle', 'timeOrdered', 'timeToCollect', 'timeRentedOut'
      ]));
    });
  });

  describe('DELETE /:id', () => {
    const execDelete = () => {
      return request(server)
        .delete('/api/rentouts/' + id)
        .set('x-auth-token', token);
    }

    it('should return 401 if user has not logged in.', async () => {
      token = '';
  
      const res = await execDelete();
  
      expect(res.status).toBe(401);
    });

    it('should return 404 if rental ID is invalid.', async () => {
      id = '1';
  
      const res = await execDelete();
  
      expect(res.status).toBe(400);
    });

    it('should return 404 if the rental is not found.', async () => {
      id = mongoose.Types.ObjectId().toHexString();
  
      const res = await execDelete();
  
      expect(res.status).toBe(404);
    });

    it('should return 403 if rental has already started.', async () => {
      rental.timeRentedOut = new Date();
      await rental.save();
  
      const res = await execDelete();
  
      expect(res.status).toBe(403);
    });

    it('should return 200 if request is valid.', async () => {
      const res = await execDelete();
  
      expect(res.status).toBe(200);
    });

    it('should increase the cycle stock if requset is valid.', async () => {
      await execDelete();

      const result = await Cycle.findById(cycle._id);
  
      expect(result.numberInStock).toBe(cycle.numberInStock + 1);
    });
  });
});