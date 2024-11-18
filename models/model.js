const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const NAME_MIN = 2;
const NAME_MAX = 50;
const DESC_MAX = 1000;

const modelSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: NAME_MIN,
    maxlength: NAME_MAX,
    unique: true,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    maxlength: DESC_MAX,
    trim: true,
  },
  brand: {
    type: {
      _id: String,
      name: String,
    },
    required: true,
  },
  type: {
    type: {
      _id: String,
      name: String,
    },
    required: true,
  },
  cycles: {
    type: [
      {
        _id: String,
        size: String,
        color: String,
        numberInStock: Number,
        hourlyRentalRate: Number,
      },
    ],
    default: [],
  },
  imgUrl: {
    type: String,
    trim: true,
  },
});

const Model = mongoose.model("Model", modelSchema);

function validate(model) {
  const schema = Joi.object({
    name: Joi.string().min(NAME_MIN).max(NAME_MAX).required(),
    description: Joi.string().max(DESC_MAX),
    brandId: Joi.objectId().required(),
    typeId: Joi.objectId().required(),
    imgUrl: Joi.string(),
  });

  return schema.validate(model);
}

exports.modelSchema = modelSchema;
exports.Model = Model;
exports.validate = validate;
