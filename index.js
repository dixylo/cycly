const config = require('config');
const mongoose = require('mongoose');
const home = require('./routes/home');
const users = require('./routes/users');
const types = require('./routes/types');
const express = require('express');
const app = express();

app.use(express.json());
app.use('/', home);
app.use('/api/users', users);
app.use('/api/types', types);

mongoose.connect('mongodb://localhost/cycly', { useNewUrlParser: true })
  .then(() => console.log('Connected to MongoDB...'))
  .catch(err => console.error('Could not connect to MongoDB...', err));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on Port ${port}...`));

