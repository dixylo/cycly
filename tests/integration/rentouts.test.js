const request = require('supertest');
const mongoose = require('mongoose');
const { User } = require('../../models/user');
const { Rental } = require('../../models/rental');

describe('/api/rentouts', () => {
  let server;
  let token;
  let userId;
  let cycleId;
  let rental;

  const exec = () => {
    return request(server)
      .post('/api/rentouts')
      .set('x-auth-token', token)
      .send({ userId, cycleId });
  }

  beforeEach(async () =>{
    server = require('../../index');

    token = new User({ isAdmin: true }).genAuthToken();
    
    userId = mongoose.Types.ObjectId();
    cycleId = mongoose.Types.ObjectId();
    
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
    await server.close();
    await Rental.remove({});
  });
  
  it('should return 401 if user has not logged in.', async () => {
    token = '';

    const res = await exec();

    expect(res.status).toBe(401);
  });

  it('should return 400 if user ID is not provided.', async () => {
    userId = '';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if cycle ID is not provided.', async () => {
    cycleId = '';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 404 if the rental is not found.', async () => {
    await Rental.remove({});

    const res = await exec();

    expect(res.status).toBe(404);
  });

  it('should return 400 if timeRentedOut is already set.', async () => {
    rental.timeRentedOut = new Date();
    await rental.save();

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 200 if request is valid.', async () => {
    const res = await exec();

    expect(res.status).toBe(200);
  });

  it('should return 200 if request is valid.', async () => {
    await exec();

    const result = await Rental.findById(rental._id);
    const diff = new Date() - result.timeRentedOut;

    expect(diff).toBeLessThan(10 * 1000);
  });

  it('should return a rental if request is valid.', async () => {
    const res = await exec();

    expect(Object.keys(res.body)).toEqual(
      expect.arrayContaining(['user', 'cycle', 'timeOrdered', 'timeRentedOut']));
  });
});