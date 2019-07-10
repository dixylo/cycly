const _ = require('lodash');
const { Brand, validate } = require('../models/brand');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const brands = await Brand.find().sort('name').select({
    name: 1,
    description: 1,
    country: 1,
    phone: 1,
    homepage:1
  });

  res.send(brands);
});

router.get('/:id', async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) return res.status(404).send('Brand with the given ID not found.');

  res.send(brand);
});

router.post('/', [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const brand = new Brand(_.pick(req.body, ['name', 'country', 'phone', 'homepage']));
  try {
    await brand.save();
    res.send(brand)
  } catch(ex) {
    console.log(ex.message);
  }
});

router.put('/:id', [auth, admin], async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const brand = await Brand.findByIdAndUpdate(
    req.params.id,
    _.pick(req.body, ['name', 'country', 'phone', 'homepage']),
    { new: true }
  );
  if (!brand) return res.status(404).send('Brand with the given ID not found.');

  res.send(brand);
});

router.delete('/:id', [auth, admin], async (req, res) => {
  const brand = await Brand.findByIdAndDelete(req.params.id);
  if (!brand) return res.status(404).send('Brand with the given ID not found.');

  res.send(brand);
});

module.exports = router;