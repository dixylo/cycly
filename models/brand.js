const mongoose = require('mongoose');
const Joi = require('joi');

const NAME_MIN = 2;
const NAME_MAX = 50;
const PHONE_MIN = 6;
const PHONE_MAX = 20;
const HOMEPAGE_MIN = 4;
const HOMEPAGE_MAX = 255;
const DESC_MAX = 255

const brandSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: NAME_MIN,
    maxlength: NAME_MAX,
    unique: true,
    required: true,
    trim: true
  },
  description: {
    type: String,
    maxlength: DESC_MAX,
    trim: true
  },
  country: {
    type: String,
    minlength: NAME_MIN,
    maxlength: NAME_MAX,
    trim: true
  },
  phone: {
    type: String,
    minlength: PHONE_MIN,
    maxlength: PHONE_MAX,
    trim: true
  },
  homepage: {
    type: String,
    minlength: HOMEPAGE_MIN,
    maxlength: HOMEPAGE_MAX,
    trim: true
  }
});

const Brand = mongoose.model('Brand', brandSchema);

function validate (brand) {
  const schema = {
    name: Joi.string().min(NAME_MIN).max(NAME_MAX).required(),
    country: Joi.string().min(NAME_MIN).max(NAME_MAX),
    phone: Joi.string().min(PHONE_MIN).max(PHONE_MAX),
    homepage: Joi.string().min(HOMEPAGE_MIN).max(HOMEPAGE_MAX)
  };

  return Joi.validate(brand, schema);
}

exports.brandSchema = brandSchema;
exports.Brand = Brand;
exports.validate = validate;