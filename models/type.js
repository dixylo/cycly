const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const NAME_MIN = 2;
const NAME_MAX = 50;
const DESC_MAX = 1000;

const typeSchema = new mongoose.Schema({
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
  models: {
    type: [
      {
        _id: String,
        name: String,
        brand: String,
        imgUrl: String,
      },
    ],
    default: [],
  },
  imgUrl: {
    type: String,
    trim: true,
  },
});

const Type = mongoose.model("Type", typeSchema);

function validate(type) {
  const schema = Joi.object({
    name: Joi.string().min(NAME_MIN).max(NAME_MAX).required(),
    description: Joi.string().max(DESC_MAX),
    imgUrl: Joi.string(),
  });

  return schema.validate(type);
}

exports.typeSchema = typeSchema;
exports.Type = Type;
exports.validate = validate;
