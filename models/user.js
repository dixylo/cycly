const mongoose = require('mongoose');
const Joi = require('joi');

const USERNAME_MIN = 4;
const USERNAME_MAX = 20;
const PASSWORD_MIN = 6;
const PASSWORD_MAX = 20;
const EMAIL_MIN = 6;
const EMAIL_MAX = 50;
const PHONE_MIN = 6;
const PHONE_MAX = 20;

const User = mongoose.model('User', new mongoose.Schema({
  username: {
    type: String,
    minlength: USERNAME_MIN,
    maxlength: USERNAME_MAX,
    required: true
  },
  password: {
    type: String,
    minlength: PASSWORD_MIN,
    maxlength: PASSWORD_MAX,
    required: true
  },
  email: {
    type: String,
    minlength: EMAIL_MIN,
    maxlength: EMAIL_MAX,
    required: true
  },
  phone: {
    type: String,
    minlength: PHONE_MIN,
    maxlength: PHONE_MAX,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
}));

function validate (user) {
  const schema = {
    username: Joi.string().min(USERNAME_MIN).max(USERNAME_MAX).required(),
    password: Joi.string().min(PASSWORD_MIN).max(PASSWORD_MAX).required(),
    email: Joi.string().min(EMAIL_MIN).max(EMAIL_MAX).required(),
    phone: Joi.string().min(PHONE_MIN).max(PHONE_MAX).required(),
    isAdmin: Joi.boolean().required()
  }

  return Joi.validate(user, schema);
}

exports.User = User;
exports.validate = validate;