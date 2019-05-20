const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const inject = require('../middleware/validate');
const { Rental, validate } = require('../models/rental');
const { Cycle } =require('../models/cycle');
const express = require('express');
const router = express.Router();

router.post('/', [auth, admin, inject(validate)], async (req, res) => {
  const rental = await Rental.lookup(req.body.userId, req.body.cycleId);
 
  if (!rental) return res.status(404).send('Rental not found.');

  if (!rental.timeRentedOut) return res.status(400).send('Rental not started.');

  if (rental.timeReturned) return res.status(400).send('Rental already processed.');

  rental.return();
  await rental.save();

  await Cycle.update(
    { _id: rental.cycle._id },
    { $inc: { numberInStock: 1 } }
  );

  res.send(rental);
});

module.exports = router;