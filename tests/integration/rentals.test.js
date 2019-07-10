const request = require('supertest');
const moment = require('moment');
const _ = require('lodash');
const { User } = require('../../models/user');
const { Cycle } = require('../../models/cycle');
const { Rental } = require('../../models/rental');

describe('/api/rentals', () => {
  let server;
  let token;
  let user;
  let cycle;
  let timeToCollect;
  let id;

  beforeEach(async () =>{
    server = require('../../index');

    token = new User({ isAdmin: true }).genAuthToken();

    timeToCollect = moment().add(3, 'hours').toDate();

    user = new User({
      username: '1234',
      password: '123456',
      email: '123456',
      phone: '123456'
    });
    await user.save();

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
  });
  afterEach(async () => {
    await server.close();
    await Rental.remove({});
    await User.remove({});
    await Cycle.remove({});
  });

  describe('POST /', () => {
    const execPost = () => {
      return request(server)
        .post('/api/rentals')
        .set('x-auth-token', token)
        .send({ userId: user._id, cycleId: cycle._id, timeToCollect });
    };

    it('should return 200 if request is valid.', async () => {
      const res = await execPost();
  
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /:id', () => {
    let rental;

    const execDelete = () => {
      return request(server)
        .delete('/api/rentals/' + id)
        .set('x-auth-token', token);
    };

    beforeEach(async () =>{
      rental = new Rental({
        user: _.pick(user, [
          '_id', 'username', 'phone'
        ]),
        cycle: _.pick(cycle, [
          '_id', 'model', 'brand', 'type', 'size', 'color', 'hourlyRentalRate'
        ]),
        timeOrdered: moment().add(-1, 'hours').toDate(),
        timeToCollect
      });
  
      await rental.save();
  
      id = rental._id;
    });

    it('should return 200 if rental has finished.', async () => {
      rental.timeRentedOut = moment().add(3, 'hours').toDate();
      rental.timeReturned = moment().add(6, 'hours').toDate();
      await rental.save();

      const res = await execDelete();
  
      expect(res.status).toBe(200);
    });

    it('should return 200 if rental has yet to finish.', async () => {
      const res = await execDelete();
  
      expect(res.status).toBe(200);
    });

    it('should increase the cycle stock if rental has yet to finish.', async () => {
      await execDelete();
  
      const result = await Cycle.findById(cycle._id);
  
      expect(result.numberInStock).toBe(cycle.numberInStock + 1);
    });
  });
});