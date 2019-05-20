const { Rental, validate } = require('../models/rental');
const auth = require('../middleware/auth');
const admin =require('../middleware/admin');
const inject = require('../middleware/validate');
const express = require('express');
const router = express.Router();

router.post('/', [auth, admin, inject(validate)], async (req, res) => {
  const rental = await Rental.lookup(req.body.userId, req.body.cycleId);
  if (!rental) return res.status(404).send('Rental not found.');

  if (rental.timeRentedOut) return res.status(400).send('Rental has already started.');

  rental.timeRentedOut = new Date();
  await rental.save();

  res.send(rental);
});

module.exports = router;