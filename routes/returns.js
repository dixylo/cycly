const Joi = require('joi');
const auth = require('../middleware/auth');
const validate = require('../middleware/validate');
const { Rental } = require('../models/rental');
const { Cycle } =require('../models/cycle');
const express = require('express');
const router = express.Router();


router.post('/', [auth, validate(validateReturn)], async (req, res) => {
  const rental = await Rental.lookup(req.body.userId, req.body.cycleId);
 
  if (!rental) return res.status(404).send('Rental not found.');

  if (rental.timeReturned) return res.status(400).send('Rental already processed.');

  rental.return();
  await rental.save();

  await Cycle.update(
    { _id: rental.cycle._id },
    { $inc: { numberInStock: 1 } }
  );

  res.send(rental);
});

function validateReturn (rental) {
  const schema = {
    userId: Joi.objectId().required(),
    cycleId: Joi.objectId().required()
  };

  return Joi.validate(rental, schema);
}

module.exports = router;