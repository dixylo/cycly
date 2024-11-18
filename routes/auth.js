const Joi = require("@hapi/joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const express = require("express");
const router = express.Router();
const { User } = require("../models/user");
const inject = require("../middleware/validate");

const PASSWORD_MIN = 6;
const PASSWORD_MAX = 255;
const EMAIL_MIN = 6;
const EMAIL_MAX = 255;

router.post("/", inject(validate), async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password.");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password.");

  const token = user.genAuthToken();
  res
    .header("Authorization", `Bearer ${token}`)
    .send(_.pick(user, ["_id", "username", "email", "phone", "isAdmin"]));
});

function validate(req) {
  const schema = Joi.object({
    email: Joi.string().min(EMAIL_MIN).max(EMAIL_MAX).email().required(),
    password: Joi.string().min(PASSWORD_MIN).max(PASSWORD_MAX).required(),
  });

  return schema.validate(req);
}

module.exports = router;
