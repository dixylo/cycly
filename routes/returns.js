const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const validateId = require('../middleware/validateObjectId');
const { Rental } = require('../models/rental');
const Fawn = require('fawn');
const express = require('express');
const router = express.Router();

router.put('/:id', [auth, admin, validateId], async (req, res) => {
  const rental = await Rental.findById(req.params.id);
 
  if (!rental) return res.status(404).send('Rental not found.');

  if (!rental.timeRentedOut) return res.status(400).send('Rental not started.');

  if (rental.timeReturned) return res.status(400).send('Rental already processed.');

  rental.return();
  const { _id, cycle, timeReturned, rentalFee } = rental;

  try {
    await new Fawn.Task()
      .update('rentals', { _id }, { timeReturned, rentalFee })
      .update('cycles', { _id: cycle._id }, { $inc: { numberInStock: 1 } })
      .run();

    res.send(rental);
  } catch (ex) {
    console.log(ex.message);
    res.status(500).send('Something failed.');
  }
});

module.exports = router;