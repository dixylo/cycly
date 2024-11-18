const bcrypt = require("bcrypt");
const _ = require("lodash");
const express = require("express");
const router = express.Router();
const { User, validate } = require("../models/user");
const validateId = require("../middleware/validateId");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const inject = require("../middleware/validate");

router.get("/", [auth, admin], async (req, res) => {
  const users = await User.find()
    .sort("username")
    .select("_id username email phone isAdmin");
  res.send(users);
});

router.get("/:id", [validateId, auth, admin], async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user)
    return res.status(404).send("Could not find the user with the given ID.");

  res.send(user);
});

router.get("/self/get", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-isAdmin");
  if (!user)
    return res.status(404).send("Could not find the user with the given ID.");

  res.send(user);
});

router.post("/", inject(validate), async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");

  user = new User(
    _.pick(req.body, ["username", "password", "email", "phone", "isAdmin"])
  );
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  try {
    await user.save();

    const token = user.genAuthToken();
    res
      .header("Authorization", `Bearer ${token}`)
      .send(_.pick(user, ["_id", "username", "email", "phone", "isAdmin"]));
  } catch (ex) {
    console.log(ex.message);
    res.status(500).send("Something failed.");
  }
});

router.put(
  "/:id",
  [validateId, auth, admin, inject(validate)],
  async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).send("User with the given ID not found.");

    const { username, phone, isAdmin } = req.body;
    user.set({ username, phone, isAdmin });

    try {
      await user.save();
      res.send(user);
    } catch (ex) {
      console.log(ex.message);
      res.status(500).send("Something failed.");
    }
  }
);

router.put("/self/update", [auth, inject(validate)], async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) return res.status(404).send("User with the given ID not found.");

  const { username, phone } = req.body;
  user.set({ username, phone });

  try {
    await user.save();
    res.send(_.pick(user, ["_id", "username", "email", "phone"]));
  } catch (ex) {
    console.log(ex.message);
    res.status(500).send("Something failed.");
  }
});

router.delete("/:id", [validateId, auth, admin], async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).send("User with the given ID not found.");

  res.send(_.pick(user, ["_id", "username", "email", "phone", "isAdmin"]));
});

module.exports = router;
