const mongoose = require('mongoose');
const Joi = require('joi');
const { brandSchema } = require('./brand');
const { typeSchema } = require('./type');

const MODEL_MIN = 2;
const MODEL_MAX = 50;
const NUMBER_MIN = 0;
const NUMBER_MAX = 255;

const Cycle = mongoose.model('Cycle', new mongoose.Schema({
  model: {
    type: String,
    minlength: MODEL_MIN,
    maxlength: MODEL_MAX,
    required: true,
    trim: true
  },
  brand: {
    type: brandSchema,
    required: true
  },
  type: {
    type: typeSchema,
    required: true
  },
  size: {
    type: String,
    enum: ['SM', 'MD', 'LG', 'XL'],
    required: true
  },
  color: [String],
  numberInStock: {
    type: Number,
    min: NUMBER_MIN,
    max: NUMBER_MAX,
    required: true
  },
  hourlyRentalRate: {
    type: Number,
    min: NUMBER_MIN,
    max: NUMBER_MAX,
    required: true
  }
}));

function validate (cycle) {
  const schema = {
    model: Joi.string().min(MODEL_MIN).max(MODEL_MAX).required(),
    brandId: Joi.objectId().required(),
    typeId: Joi.objectId().required(),
    size: Joi.string().required(),
    color: Joi.array().items(Joi.string()),
    numberInStock: Joi.number().integer().min(NUMBER_MIN).max(NUMBER_MAX).required(),
    hourlyRentalRate: Joi.number().min(NUMBER_MIN).max(NUMBER_MAX).required()
  };

  return Joi.validate(cycle, schema);
}

exports.Cycle = Cycle;
exports.validate = validate;