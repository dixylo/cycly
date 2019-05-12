const { Rental, validate } = require('../models/rental');
const { User } = require('../models/user');
const { Cycle } = require('../models/cycle');
const auth = require('../middleware/auth');
const mongoose = require('mongoose');
const Fawn = require('fawn');
const express = require('express');
const router = express.Router();

Fawn.init(mongoose);

router.get('/', auth, async (req, res) => {
  const rentals = await Rental.find().sort('-rentedTime');
  res.send(rentals);
});

router.get('/:id', auth, async (req, res) => {
  const rental = await Rental.findById(req.params.id);
  if (!rental) return res.status(404).send('Rental with the given ID not found.');

  res.send(rental);
});

router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { userId, cycleId } = req.body;

  const user = await User.findById(userId);
  if (!user) return res.status(404).send('User with the given ID not found.');

  const cycle = await Cycle.findById(cycleId);
  if (!cycle) return res.status(404).send('Cycle with the given ID not found.');

  if (cycle.numberInStock === 0) return res.status(400).send('Cycle not in stock.');

  const { username, phone } = user;
  const { model, brand, type, size, color, hourlyRentalRate } = cycle;
  const rental = new Rental({
    user: {
      _id: userId,
      username,
      phone
    },
    cycle: {
      _id: cycleId,
      model,
      brand,
      type,
      size,
      color,
      hourlyRentalRate
    }
  });
  try {
    await new Fawn.Task()
      .save('rentals', rental)
      .update('cycles', { _id: cycle._id }, { $inc: { numberInStock: -1 } })
      .run();

    res.send(rental);
  } catch(ex) {
    console.log(ex.message);
    res.status(500).send('Something failed.');
  }
});

router.put('/:id', auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const { userId, cycleId } = req.body;

  const user = await User.findById(userId);
  if (!user) return res.status(404).send('User with the given ID not found.');

  const cycle = await Cycle.findById(cycleId);
  if (!cycle) return res.status(404).send('Cycle with the given ID not found.');

  const { username, phone } = user;
  const { model, brand, type, size, color, hourlyRentalRate } = cycle;
  const rental = await Rental.findByIdAndUpdate(
    req.params.id, {
      user: {
        _id: userId,
        username,
        phone
      },
      cycle: {
        _id: cycleId,
        model,
        brand,
        type,
        size,
        color,
        hourlyRentalRate
      },
    }, {
      new: true
    }
  );
  if (!rental) return res.status(404).send('Rental with the given ID not found.');

  res.send(rental);
});

router.delete('/:id', auth, async (req, res) => {
  const rental = await Rental.findByIdAndDelete(req.params.id);
  if (!rental) return res.status(404).send('Rental with the given ID not found.');

  res.send(rental);
});

module.exports = router; 