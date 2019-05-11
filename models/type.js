const mongoose = require('mongoose');
const Joi = require('joi');

const NAME_MIN = 2;
const NAME_MAX = 50;
const DESC_MAX = 255;

const typeSchema = new  mongoose.Schema({
  name: {
    type: String,
    minlength: NAME_MIN,
    maxlength: NAME_MAX,
    unique: true,
    required: true,
    trim: true
  },
  desc: {
    type: String,
    maxlength: DESC_MAX,
    trim: true
  }
});

const Type = mongoose.model('Type', typeSchema);

function validate (type) {
  const schema = {
    name: Joi.string().min(NAME_MIN).max(NAME_MAX).required(),
    desc: Joi.string().max(DESC_MAX)
  };

  return Joi.validate(type, schema);
}

exports.typeSchema = typeSchema;
exports.Type = Type;
exports.validate = validate;