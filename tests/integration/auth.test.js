const request = require('supertest');
const { User } = require('../../models/user');
const { Type } = require('../../models/type');

describe('Authen Middleware IntTest', () => {
  let server;
  beforeEach(() => { server = require('../../index'); });
  afterEach(async () => {
    await Type.remove({});
    await server.close();
  });

  let token;

  const exec = () => {
    return request(server)
      .post('/api/types')
      .set('x-auth-token', token)
      .send({ name: 'TestType', description: 'Description of TestType.' });
  };

  beforeEach(() => {
    token = new User({ isAdmin: true }).genAuthToken();
  });

  it('should return 401 if no token is provided.', async () => {
    token = '';

    const res = await exec();

    expect(res.status).toBe(401);
  });

  it('should return 400 if token is invalid.', async () => {
    token = '1';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 200 if token is valid.', async () => {
    const res = await exec();

    expect(res.status).toBe(200);
  });
});