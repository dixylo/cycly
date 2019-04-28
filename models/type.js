const mongoose = require('mongoose');
const Joi = require('joi');

const Type = mongoose.model('Type', new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 50,
    required: true
  },
  desc: {
    type: String,
    maxlength: 255
  }
}));

function validate (type) {
  const schema = {
    name: Joi.string().min(2).max(50).required(),
    desc: Joi.string().max(500)
  }

  return Joi.validate(type, schema);
}

exports.Type = Type;
exports.validate = validate;