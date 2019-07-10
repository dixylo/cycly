const request = require('supertest');
const mongoose = require('mongoose');
const { Type } = require('../../models/type');
const { User } = require('../../models/user');
const types = require('../../mock/types');

describe('/api/types', () => {
  let server;
  beforeEach(() => { server = require('../../index'); });
  afterEach(async () => {
    await Type.remove({});
    await server.close();
  });

  describe('GET /', () => {
    it('should return all types.', async () => {
      await Type.collection.insertMany(types);

      const res = await request(server).get('/api/types');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(types.length);
      types.forEach(
        type => expect(
          res.body.some(t => t.name === type.name && t.description === type.description )
        ).toBeTruthy()
      );
    });
  });

  describe('GET /:id', () => {
    it('should return a type if a valid ID is passed.', async () => {
      const type = new Type({ name: 'Plike', description: 'A bike that can fly.' });
      await type.save();

      const res = await request(server).get('/api/types/' + type._id);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('name', type.name);
      expect(res.body).toHaveProperty('description', type.description);
    });

    it('should return 400 if an invalid ID is passed.', async () => {
      const res = await request(server).get('/api/types/1');

      expect(res.status).toBe(400);
    });

    it('should return 404 if no type with the given ID exists.', async () => {
      const id = mongoose.Types.ObjectId();
      const res = await request(server).get('/api/types/' + id);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /', () => {
    let token;
    let name;
    let description;

    const exec = () => {
      return request(server)
        .post('/api/types')
        .set('x-auth-token', token)
        .send({ name, description });
    };

    beforeEach(() => {
      token = new User({ isAdmin: true }).genAuthToken();
      name = 'TestType';
      description = 'Description of TestType';
    });

    it('should return 401 if user has not logged in.', async () => {
      token = '';

      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 400 if type name is less than 2 characters.', async () => {
      name = 'T';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if type name is more than 50 characters.', async () => {
      name = new Array(52).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if description name is more than 255 characters.', async () => {
      description = new Array(257).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should save the type successfully if it is valid.', async () => {
      await exec();

      const type = await Type.find({ name });

      expect(type).not.toBeNull();
      expect(type.length).not.toBe(0);
    });

    it('should return the type if it is valid.', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', name);
      expect(res.body).toHaveProperty('description', description);
    });
  });
});