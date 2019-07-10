const { Rental, validate } = require('../models/rental');
const { User } = require('../models/user');
const { Cycle } = require('../models/cycle');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const inject = require('../middleware/validate');
const Fawn = require('fawn');
const express = require('express');
const router = express.Router();

router.get('/', [auth, admin], async (req, res) => {
  const rentals = await Rental.find().sort('-timeRentedOut');
  if (!rentals.length) return res.status(404).send('No rentals found.');

  res.send(rentals);
});

router.get('/:id', auth, async (req, res) => {
  const rental = await Rental.findById(req.params.id);
  if (!rental) return res.status(404).send('Rental with the given ID not found.');

  res.send(rental);
});

router.get('/mine', auth, async (req, res) => {
  const rentals = await Rental.lookup(req.user._id);
  if (!rentals.length) return res.status(404).send('You do not have any rentals.');

  res.send(rentals);
});

router.get('/user/:id', [auth, admin], async (req, res) => {
  const rentals = await Rental.lookup(req.params.id);
  if (!rentals.length) return res.status(404).send('This user has no rentals.');

  res.send(rentals);
});

router.post('/', [auth, inject(validate)], async (req, res) => {
  const { userId, cycleId, timeToCollect } = req.body;

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
    },
    timeToCollect
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

router.delete('/:id', [auth, admin], async (req, res) => {
  const rental = await Rental.findById(req.params.id);
  if (!rental) return res.status(404).send('Rental with the given ID not found.');

  const { _id, cycle, timeReturned } = rental;
  if (timeReturned) {
    await Rental.deleteOne({ _id });
    
    res.send(rental);
  } else {
    try {
      await new Fawn.Task()
        .remove('rentals', { _id })
        .update('cycles', { _id: cycle._id }, { $inc: { numberInStock: 1 } })
        .run();
  
      res.send(rental);
    } catch (ex) {
      console.log(ex.message);
      res.status(500).send('Something failed.');
    }
  }
});

module.exports = router;