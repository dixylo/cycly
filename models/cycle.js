const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const NUMBER_MIN = 0;
const NUMBER_MAX = 255;

const Cycle = mongoose.model(
  "Cycle",
  new mongoose.Schema({
    model: {
      type: {
        _id: String,
        name: String,
      },
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    size: {
      type: String,
      trim: true,
    },
    color: {
      type: String,
      trim: true,
    },
    numberInStock: {
      type: Number,
      min: NUMBER_MIN,
      max: NUMBER_MAX,
      required: true,
    },
    hourlyRentalRate: {
      type: Number,
      min: NUMBER_MIN,
      max: NUMBER_MAX,
      required: true,
    },
  })
);

function validate(cycle) {
  const schema = Joi.object({
    modelId: Joi.objectId().required(),
    size: Joi.string(),
    color: Joi.string(),
    numberInStock: Joi.number()
      .integer()
      .min(NUMBER_MIN)
      .max(NUMBER_MAX)
      .required(),
    hourlyRentalRate: Joi.number().min(NUMBER_MIN).max(NUMBER_MAX).required(),
  });

  return schema.validate(cycle);
}

exports.Cycle = Cycle;
exports.validate = validate;
