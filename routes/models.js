const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const { Model, validate } = require("../models/model");
const { Brand } = require("../models/brand");
const { Type } = require("../models/type");
const validateId = require("../middleware/validateId");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const inject = require("../middleware/validate");

router.get("/", async (req, res) => {
  const models = await Model.find().sort("name");
  res.send(models);
});

router.get("/:id", validateId, async (req, res) => {
  const model = await Model.findById(req.params.id);
  if (!model) return res.status(404).send("Model with the given ID not found.");

  res.send(model);
});

router.post("/", [auth, admin, inject(validate)], async (req, res) => {
  const { name, description, brandId, typeId, imgUrl } = req.body;

  const brand = await Brand.findById(brandId).select({ _id: 1, name: 1 });
  if (!brand) return res.status(400).send("Invalid brand.");

  const type = await Type.findById(typeId).select({ _id: 1, name: 1 });
  if (!type) return res.status(400).send("Invalid type.");

  const model = new Model({
    name,
    description,
    brand,
    type,
    imgUrl,
  });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await model.save({ session });
    await Brand.updateOne(
      { _id: brand._id },
      {
        $push: {
          models: {
            _id: model._id,
            name: model.name,
            type: type.name,
            imgUrl,
          },
        },
      },
      { session }
    );
    await Type.updateOne(
      { _id: type._id },
      {
        $push: {
          models: {
            _id: model._id,
            name: model.name,
            brand: brand.name,
            imgUrl,
          },
        },
      },
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    res.send(model);
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
    const { name, description, imgUrl } = req.body;
    try {
      const model = await Model.findOneAndUpdate(
        { _id: req.params.id },
        { name, description, imgUrl },
        { new: true }
      );
      if (!model)
        return res.status(404).send("Model with the given ID not found.");

      res.send(model);
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
    const model = await Model.findById(req.params.id).session(session);
    if (!model) {
      await session.abortTransaction();
      return res.status(404).send("Model with the given ID not found.");
    }

    if (model.cycles.length) {
      await session.abortTransaction();
      return res.status(403).send("Could not delete models with cycles");
    }

    const { _id, brand, type } = model;

    // Remove model
    await Model.deleteOne({ _id }).session(session);

    // Update brand and type to remove reference to model
    await Brand.updateOne(
      { _id: brand._id },
      { $pull: { models: { _id } } },
      { session }
    );
    await Type.updateOne(
      { _id: type._id },
      { $pull: { models: { _id } } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();
    res.send(model);
  } catch (ex) {
    await session.abortTransaction();
    session.endSession();
    console.error(ex.message);
    res.status(500).send("Something failed.");
  }
});

module.exports = router;
