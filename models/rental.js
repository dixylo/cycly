const mongoose = require('mongoose');
const moment = require('moment');
const Joi = require('joi');

const rentalSchema = new mongoose.Schema({
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
  timeRentedOut: {
    type: Date,
    required: true,
    default: Date.now
  },
  timeReturned: {
    type: Date
  },
  rentalFee: {
    type: Number,
    min: 0
  }
});

rentalSchema.statics.lookup = function (userId, cycleId) {
  return this.findOne({
    'user._id': userId,
    'cycle._id': cycleId
  });
};

rentalSchema.methods.return = function () {
  this.timeReturned = new Date();

  this.rentalFee = this.cycle.hourlyRentalRate
    * moment().diff(this.timeRentedOut, 'hours');
};

const Rental = mongoose.model('Rental', rentalSchema);

function validate (rental) {
  const schema = {
    userId: Joi.objectId().required(),
    cycleId: Joi.objectId().required()
  };

  return Joi.validate(rental, schema);
}

exports.Rental = Rental;
exports.validate = validate;