const mongoose = require('mongoose');
const request = require('supertest');
const moment = require('moment');
const _ = require('lodash');
const { Rental } = require('../../models/rental');
const { Cycle } = require('../../models/cycle');
const { User } = require('../../models/user');

describe('/api/returns', () => {
  let server;
  let token;
  let timeToCollect;
  let cycle;
  let rental;
  let id;

  const exec = () => {
    return request(server)
      .put('/api/returns/' + id)
      .set('x-auth-token', token);
  };

  beforeEach(async () => {
    server = require('../../index');
    
    token = new User({ isAdmin: true }).genAuthToken();

    timeToCollect = moment().add(-3, 'hours').toDate();

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
      timeOrdered: moment().add(-5, 'hours').toDate(),
      timeToCollect,
      timeRentedOut: moment().add(-3, 'hours').toDate()
    });

    await rental.save();

    id = rental._id;
  });

  afterEach(async () => {
    await Rental.remove({});
    await Cycle.remove({});
    await server.close();
  });

  it('should return 401 if user has not logged in.', async () => {
    token = '';

    const res = await exec();

    expect(res.status).toBe(401);
  });

  it('should return 403 if user is not the admin.', async () => {
    token = new User({ isAdmin: false }).genAuthToken();

    const res = await exec();

    expect(res.status).toBe(403);
  });

  it('should return 400 if rental ID is invalid.', async () => {
    id = '1';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 404 if no rental is found for the ID.', async () => {
    id = mongoose.Types.ObjectId().toHexString();

    const res = await exec();

    expect(res.status).toBe(404);
  });

  it('should return 400 if rental has yet to start.', async () => {
    rental.timeRentedOut = null;
    await rental.save();

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if rental is already processed.', async () => {
    rental.timeReturned = new Date();
    await rental.save();

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 200 if request is valid.', async () => {
    const res = await exec();

    expect(res.status).toBe(200);
  });

  it('should set the timeReturned if input is valid.', async () => {
    await exec();

    const result = await Rental.findById(rental._id);
    const diff = new Date() - result.timeReturned;

    expect(diff).toBeLessThan(10 * 1000);
  });

  it('should calculate the rental fee if input is valid.', async () => {
    await exec();

    const result = await Rental.findById(rental._id);

    expect(result.rentalFee).toBe(30);
  });

  it('should increase the cycle stock if input is valid.', async () => {
    await exec();

    const result = await Cycle.findById(cycle._id);

    expect(result.numberInStock).toBe(cycle.numberInStock + 1);
  });
  
  it('should return the rental if input is valid.', async () => {
    const res = await exec();
    
    expect(Object.keys(res.body)).toEqual(expect.arrayContaining([
      'user', 'cycle', 'timeOrdered', 'timeToCollect',
      'timeRentedOut', 'timeReturned', 'rentalFee'
    ]));
  });
});