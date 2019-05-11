const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const config = require('config');
const mongoose = require('mongoose');
const home = require('./routes/home');
const auth = require('./routes/auth');
const users = require('./routes/users');
const cycles = require('./routes/cycles');
const brands = require('./routes/brands');
const types = require('./routes/types');
const rentals = require('./routes/rentals');
const express = require('express');
const app = express();

if (!config.get('jwtPrivateKey')) {
  console.error('FATAL ERROR: jwtPrivateKey is not defined.');
  process.exit(1);
}

mongoose.connect('mongodb://localhost/cycly', { useNewUrlParser: true })
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

app.use(express.json());
app.use('/', home);
app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/cycles', cycles);
app.use('/api/brands', brands);
app.use('/api/types', types);
app.use('/api/rentals', rentals);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on Port ${port}...`));