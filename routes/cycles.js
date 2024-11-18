const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const { Cycle, validate } = require("../models/cycle");
const { Model } = require("../models/model");
const { Rental } = require("../models/rental");
const validateId = require("../middleware/validateId");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const inject = require("../middleware/validate");

router.get("/", async (req, res) => {
  const cycles = await Cycle.find().sort("model");
  res.send(cycles);
});

router.get("/:id", validateId, async (req, res) => {
  const cycle = await Cycle.findById(req.params.id);
  if (!cycle) return res.status(404).send("Cycle with the given ID not found.");

  res.send(cycle);
});

router.post("/", [auth, admin, inject(validate)], async (req, res) => {
  const { modelId, size, color, numberInStock, hourlyRentalRate } = req.body;

  const model = await Model.findById(modelId).select({
    _id: 1,
    name: 1,
    brand: 1,
    type: 1,
  });
  if (!model) return res.status(400).send("Invalid model.");

  const { _id, name, brand, type } = model;
  const cycle = new Cycle({
    model: { _id, name },
    brand: brand.name,
    type: type.name,
    size,
    color,
    numberInStock,
    hourlyRentalRate,
  });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await cycle.save({ session });
    await Model.updateOne(
      { _id },
      {
        $push: {
          cycles: {
            _id: cycle._id,
            size,
            color,
            numberInStock,
            hourlyRentalRate,
          },
        },
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    res.send(cycle);
  } catch (ex) {
    await session.abortTransaction();
    session.endSession();
    console.error(ex.message);
    res.status(500).send("Something failed.");
  }
});

router.put(
  "/:id",
  [validateId, auth, admin, inject(validate)],
  async (req, res) => {
    const { size, color, numberInStock, hourlyRentalRate } = req.body;
    try {
      const cycle = await Cycle.findOneAndUpdate(
        { _id: req.params.id },
        { size, color, numberInStock, hourlyRentalRate },
        { new: true }
      );
      if (!cycle)
        return res.status(404).send("Cycle with the given ID not found.");

      res.send(cycle);
    } catch (ex) {
      console.error(ex.message);
      res.status(500).send("Something failed.");
    }
  }
);

router.delete("/:id", [validateId, auth, admin], async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cycle = await Cycle.findById(req.params.id).session(session);
    if (!cycle) {
      await session.abortTransaction();
      return res.status(404).send("Cycle with the given ID not found.");
    }

    const query = { "cycle._id": req.params.id };
    const rentals = await Rental.lookup(query);
    if (rentals && rentals.length) {
      await session.abortTransaction();
      return res.status(403).send("Could not delete cycles ever rented.");
    }

    const { _id, model } = cycle;

    // Remove cycle
    await Cycle.deleteOne({ _id }).session(session);

    // Update model to remove reference to cycle
    await Model.updateOne(
      { _id: model._id },
      { $pull: { cycles: { _id } } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    res.send(cycle);
  } catch (ex) {
    await session.abortTransaction();
    session.endSession();
    console.error(ex.message);
    res.status(500).send("Something failed.");
  }
});

module.exports = router;
