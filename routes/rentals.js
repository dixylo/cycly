const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const { Rental, validate } = require("../models/rental");
const { User } = require("../models/user");
const { Cycle } = require("../models/cycle");
const validateId = require("../middleware/validateId");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const inject = require("../middleware/validate");

router.get("/", [auth, admin], async (req, res) => {
  const rentals = await Rental.find().sort("-timeRentedOut");
  if (!rentals.length) return res.status(404).send("No rentals found.");

  res.send(rentals);
});

router.get("/:id", [validateId, auth, admin], async (req, res) => {
  const rental = await Rental.findById(req.params.id);
  if (!rental)
    return res.status(404).send("Rental with the given ID not found.");

  res.send(rental);
});

router.get("/of/mine", auth, async (req, res) => {
  const query = { "user._id": req.user._id };
  const rentals = await Rental.lookup(query);
  if (!rentals.length)
    return res.status(404).send("You do not have any rentals.");

  res.send(rentals);
});

router.get("/user/:id", [validateId, auth, admin], async (req, res) => {
  const query = { "user._id": req.params.id };
  const rentals = await Rental.lookup(query);
  if (!rentals.length) return res.status(404).send("This user has no rentals.");

  res.send(rentals);
});

router.post("/", [auth, inject(validate)], async (req, res) => {
  const { userId, cycleId, timeToCollect } = req.body;

  const user = await User.findById(userId);
  if (!user) return res.status(404).send("User with the given ID not found.");

  const cycle = await Cycle.findById(cycleId);
  if (!cycle) return res.status(404).send("Cycle with the given ID not found.");

  if (cycle.numberInStock === 0)
    return res.status(400).send("Cycle not in stock.");

  const { username, email, phone } = user;
  const { model, brand, type, size, color, hourlyRentalRate } = cycle;
  const rental = new Rental({
    user: {
      _id: userId,
      username,
      email,
      phone,
    },
    cycle: {
      _id: cycleId,
      model: model.name,
      brand,
      type,
      size,
      color,
      hourlyRentalRate,
    },
    timeToCollect,
  });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await rental.save({ session });
    await Cycle.updateOne(
      { _id: cycle._id },
      { $inc: { numberInStock: -1 } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    res.send(rental);
  } catch (ex) {
    await session.abortTransaction();
    session.endSession();
    console.error(ex.message);
    res.status(500).send("Something failed.");
  }
});

router.put("/:id", [validateId, auth, admin], async (req, res) => {
  const rental = await Rental.findById(req.params.id);
  if (!rental) return res.status(404).send("Rental not found.");
  if (rental.timeRentedOut)
    return res.status(400).send("Rental already started.");

  rental.timeRentedOut = new Date();
  await rental.save();

  res.send(rental);
});

router.delete("/:id", [validateId, auth], async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const rental = await Rental.findById(req.params.id).session(session);
    if (!rental) {
      await session.abortTransaction();
      return res.status(404).send("Rental with the given ID not found.");
    }

    if (rental.timeRentedOut) {
      await session.abortTransaction();
      return res.status(403).send("Could not delete rentals already started.");
    }

    const { _id, cycle } = rental;

    // Remove rental
    await Rental.deleteOne({ _id }).session(session);

    // Update cycle stock
    await Cycle.updateOne(
      { _id: cycle._id },
      { $inc: { numberInStock: 1 } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    res.send(rental);
  } catch (ex) {
    await session.abortTransaction();
    session.endSession();
    console.error(ex.message);
    res.status(500).send("Something failed.");
  }
});

module.exports = router;
