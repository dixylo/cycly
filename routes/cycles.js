const { Cycle, validate } = require('../models/cycle');
const { Brand } = require('../models/brand');
const { Type } = require('../models/type');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const cycles = await Cycle.find().sort('model');
  res.send(cycles);
});

router.get('/:id', async (req, res) => {
  const cycle = await Cycle.findById(req.params.id);
  if (!cycle) return res.status(404).send('Cycle with the given ID not found.');

  res.send(cycle);
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { model, brandId, typeId, size, color, numberInStock, hourlyRentalRate } = req.body;

  const brand = await Brand.findById(brandId);
  if (!brand) return res.status(400).send('Invalid brand.');

  const type = await Type.findById(typeId);
  if (!type) return res.status(400).send('Invalid type.');

  const cycle = new Cycle ({
    model,
    brand: {
      _id: brandId,
      name: brand.name
    },
    type: {
      _id: typeId,
      name: type.name
    },
    size,
    color,
    numberInStock,
    hourlyRentalRate
  });
  try {
    await cycle.save();
    res.send(cycle);
  } catch (ex) {
    console.log(ex.message);
  }
});

router.put('/:id', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { model, brandId, typeId, size, color, numberInStock, hourlyRentalRate } = req.body;

  const brand = await Brand.findById(brandId);
  if (!brand) return res.status(400).send('Invalid brand.');

  const type = await Type.findById(typeId);
  if (!type) return res.status(400).send('Invalid type.');

  const cycle = await Cycle.findByIdAndUpdate(req.params.id, {
    model,
    brand: {
      _id: brandId,
      name: brand.name
    },
    type: {
      _id: typeId,
      name: type.name
    },
    size,
    color,
    numberInStock,
    hourlyRentalRate
  });
  if (!cycle) return res.status(404).send('Cycle with the given ID not found.');

  res.send(cycle);
});

router.delete('/:id', async (req, res) => {
  const cycle = await Cycle.findByIdAndDelete(req.params.id);
  if (!cycle) return res.status(404).send('Cycle with the given ID not found.');

  res.send(cycle);
});

module.exports = router;