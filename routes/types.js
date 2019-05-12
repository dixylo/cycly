const _ = require('lodash');
const { Type, validate } = require('../models/type');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const types = await Type.find().sort('name').select({ name: 1, desc: 1 });
  res.send(types);
});

router.get('/:id', async (req, res) => {
  const type = await Type.findById(req.params.id);
  if (!type) return res.status(404).send('Type with the given ID not found.');
  res.send(type);
});

router.post('/', [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const type = new Type(_.pick(req.body, ['name', 'desc']));
  try {
    await type.save();
    res.send(type);
  } catch(ex) {
    console.log(ex.message);
  }
});

router.put('/:id', [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const type = await Type.findByIdAndUpdate(
    req.params.id,
    _.pick(req.body, ['name', 'desc']),
    { new: true }
  );
  if (!type) return res.status(404).send('Type with the given ID not found.');

  res.send(type);
});

router.delete('/:id', [auth, admin], async (req, res) => {
  const type = await Type.findByIdAndDelete(req.params.id);
  if (!type) return res.status(404).send('Type with the given ID not found.');

  res.send(type);
});

module.exports = router;