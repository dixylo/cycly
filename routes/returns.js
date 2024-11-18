const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const { Rental } = require("../models/rental");
const { Cycle } = require("../models/cycle");
const validateId = require("../middleware/validateId");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

router.put("/:id", [validateId, auth, admin], async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const rental = await Rental.findById(req.params.id).session(session);
    if (!rental) {
      await session.abortTransaction();
      return res.status(404).send("Rental not found.");
    }
    if (!rental.timeRentedOut) {
      await session.abortTransaction();
      return res.status(400).send("Rental not started yet.");
    }
    if (rental.timeReturned) {
      await session.abortTransaction();
      return res.status(400).send("Rental already processed.");
    }

    rental.return();
    await rental.save({ session });

    await Cycle.updateOne(
      { _id: rental.cycle._id },
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

router.delete("/:id", [validateId, auth, admin], async (req, res) => {
  const rental = await Rental.findById(req.params.id);
  if (!rental)
    return res.status(404).send("Rental with the given ID not found.");

  const { _id, timeReturned } = rental;
  if (!timeReturned)
    return res.status(403).send("Could not delete rentals not returned yet.");

  await Rental.deleteOne({ _id });

  res.send(rental);
});

module.exports = router;
