const mongoose = require('mongoose');
const Joi = require('joi');

const Rental = mongoose.model('Rental', new mongoose.Schema({
  user: {
    type: new mongoose.Schema({
      username: {
        type: String,
        required: true
      },
      phone: {
        type: String,
        required: true
      }
    }),
    required: true
  },
  cycle: {
    type: new mongoose.Schema({
      model: {
        type: String,
        required: true
      },
      brand: {
        type: String,
        required: true
      },
      type: {
        type: String,
        required: true
      },
      size: {
        type: String,
        required: true
      },
      color: {
        type: String,
        required: true
      },
      hourlyRentalRate: {
        type: Number,
        required: true
      }
    }),
    required: true
  },
  rentedTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  returnedTime: {
    type: Date
  },
  rentalFee: {
    type: Number,
    min: 0
  }
}));

function validate (rental) {
  const schema = {
    userId: Joi.objectId().required(),
    cycleId: Joi.objectId().required()
  };

  return Joi.validate(rental, schema);
}

exports.Rental = Rental;
exports.validate = validate;