const mongoose = require('mongoose');
const request = require('supertest');
const moment = require('moment');
const { Rental } = require('../../models/rental');
const { Cycle } = require('../../models/cycle');
const { User } = require('../../models/user');

describe('/api/returns', () => {
  let server;
  let userId;
  let cycleId;
  let rental;
  let cycle;
  let token;

  const exec = () => {
    return request(server)
      .post('/api/returns')
      .set('x-auth-token', token)
      .send({ userId, cycleId });
  };

  beforeEach(async () => {
    server = require('../../index');
    
    token = new User().genAuthToken();

    userId = mongoose.Types.ObjectId();
    cycleId = mongoose.Types.ObjectId();

    cycle = new Cycle({
      _id: cycleId,
      model: '12',
      brand: { name: '22' },
      type: { name: '32' },
      size: 'MD',
      color: 'white',
      numberInStock: 10,
      hourlyRentalRate: 1
    });

    await cycle.save();

    rental = new Rental({
      user: {
        _id: userId,
        username: '1234',
        phone: '123456'
      },
      cycle: {
        _id: cycleId,
        model: '12',
        brand: '22',
        type: '32',
        size: 'MD',
        color: 'white',
        hourlyRentalRate: 1
      }
    });

    await rental.save();
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

  it('should return 400 if no user ID is provided.', async () => {
    userId = '';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if no cycle ID is provided.', async () => {
    cycleId = '';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 404 if no rental is found for the user/cycle.', async () => {
    await Rental.remove({});

    const res = await exec();

    expect(res.status).toBe(404);
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
    rental.timeRentedOut = moment().add(-3, 'hours').toDate();
    await rental.save();

    await exec();

    const result = await Rental.findById(rental._id);

    expect(result.rentalFee).toBe(3);
  });

  it('should increase the cycle stock if input is valid.', async () => {
    await exec();

    const result = await Cycle.findById(cycleId);

    expect(result.numberInStock).toBe(cycle.numberInStock + 1);
  });
  
  it('should return the  rental if input is valid.', async () => {
    const res = await exec();
    
    expect(Object.keys(res.body)).toEqual(
      expect.arrayContaining(['user', 'cycle', 'timeRentedOut', 'timeReturned', 'rentalFee'])
    );
  });
});