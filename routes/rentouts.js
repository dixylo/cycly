const { Rental } = require('../models/rental');
const auth = require('../middleware/auth');
const admin =require('../middleware/admin');
const validateId = require('../middleware/validateObjectId');
const Fawn = require('fawn');
const express = require('express');
const router = express.Router();

router.put('/:id', [auth, admin, validateId], async (req, res) => {
  const rental = await Rental.findById(req.params.id);
  
  if (!rental) return res.status(404).send('Rental not found.');

  if (rental.timeRentedOut) return res.status(400).send('Rental has already started.');

  rental.timeRentedOut = new Date();
  await rental.save();

  res.send(rental);
});

router.delete('/:id', [auth, validateId], async (req, res) => {
  const rental = await Rental.findById(req.params.id);
  if (!rental) return res.status(404).send('Rental with the given ID not found.');

  if (rental.timeRentedOut) return res.status(403).send('Cannot delete rentals already started.');

  const { _id, cycle } = rental;
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
});

module.exports = router;