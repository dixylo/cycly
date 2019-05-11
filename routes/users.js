const bcrypt = require('bcrypt');
const _ = require('lodash');
const { User, validate } = require('../models/user');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const users = await User.find().sort('username').select('_id username email phone isAdmin');
  res.send(users);
});

router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).send('Could not find the user with the given ID.');

  res.send(_.pick(user, ['_id', 'username', 'email', 'phone', 'isAdmin']));
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send('User already registered.');

  user = new User(_.pick(req.body, ['username', 'password', 'email', 'phone', 'isAdmin']));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  try {
    await user.save();

    const token = user.genAuthToken();
    res.header('x-auth-token', token).send(_.pick(user, ['_id', 'username', 'email', 'phone', 'isAdmin']));
  } catch(ex) {
    console.log(ex.message);
  }
});

router.put('/:id', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findByIdAndUpdate(
    req.params.id,
    _.pick(req.body, ['username', 'password', 'email', 'phone', 'isAdmin']),
    { new: true }
  );
  if (!user) return res.status(404).send('User with the given ID not found.');

  res.send(_.pick(user, ['_id', 'username', 'email', 'phone', 'isAdmin']));
});

router.delete('/:id', async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).send('User with the given ID not found.');

  res.send(_.pick(user, ['_id', 'username', 'email', 'phone', 'isAdmin']));
});

module.exports = router;