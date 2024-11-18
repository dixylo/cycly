const jwt = require("jsonwebtoken");
const config = require("config");
const mongoose = require("mongoose");
const Joi = require("@hapi/joi");

const USERNAME_MIN = 4;
const USERNAME_MAX = 20;
const PASSWORD_MIN = 6;
const PASSWORD_MAX_DB = 1024;
const PASSWORD_MAX_JOI = 255;
const EMAIL_MIN = 6;
const EMAIL_MAX = 255;
const PHONE_MIN = 6;
const PHONE_MAX = 20;

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    minlength: USERNAME_MIN,
    maxlength: USERNAME_MAX,
    required: true,
    trim: true,
  },
  password: {
    type: String,
    minlength: PASSWORD_MIN,
    maxlength: PASSWORD_MAX_DB,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    minlength: EMAIL_MIN,
    maxlength: EMAIL_MAX,
    unique: true,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    minlength: PHONE_MIN,
    maxlength: PHONE_MAX,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

userSchema.methods.genAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    config.get("jwtPrivateKey")
  );
  return token;
};

const User = mongoose.model("User", userSchema);

function validate(user) {
  const schema = Joi.object({
    username: Joi.string().min(USERNAME_MIN).max(USERNAME_MAX).required(),
    password: Joi.string().min(PASSWORD_MIN).max(PASSWORD_MAX_JOI).required(),
    email: Joi.string().min(EMAIL_MIN).max(EMAIL_MAX).email().required(),
    phone: Joi.string().min(PHONE_MIN).max(PHONE_MAX).required(),
    isAdmin: Joi.boolean(),
  });

  return schema.validate(user);
}

exports.User = User;
exports.validate = validate;
