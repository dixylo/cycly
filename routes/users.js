const { User, validate } = require('../models/user');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const users = await User.find().sort('username');
  res.send(users);
});

router.get('/:id', async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).send('Could not find the user with the given ID.');

  res.send(user);
});

router.post('/', async (req, res) => {
  const { error, value: { username, password, email, phone, isAdmin } } = validate(req.body);
  if (error) return res.status(400).send('User Info Invalid.');

  let user = new User({ username, password, email, phone, isAdmin });

  user = await user.save();

  res.send(user);
});

router.put('/:id', async (req, res) => {
  const { error, value: { username, password, email, phone, isAdmin } } = validate(req.body);
  if (error) return res.status(400).send('User Info Invalid.');

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { username, password, email, phone, isAdmin },
    { new: true }
  );
  if (!user) return res.status(404).send('Could not find the user with the given ID.');

  res.send(user);
});

router.delete('/:id', async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).send('Could not find the user with the given ID.');

  res.send(user);
});

module.exports = router;