const express = require('express');
const home = require('../routes/home');
const auth = require('../routes/auth');
const users = require('../routes/users');
const cycles = require('../routes/cycles');
const brands = require('../routes/brands');
const types = require('../routes/types');
const rentals = require('../routes/rentals');
const error = require('../middleware/error');

module.exports = function (app) {
  app.use(express.json());
  app.use('/', home);
  app.use('/api/auth', auth);
  app.use('/api/users', users);
  app.use('/api/cycles', cycles);
  app.use('/api/brands', brands);
  app.use('/api/types', types);
  app.use('/api/rentals', rentals);
  app.use(error);
};