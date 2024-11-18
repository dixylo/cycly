const express = require("express");
const router = express.Router();
const { Type, validate } = require("../models/type");
const validateId = require("../middleware/validateId");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const inject = require("../middleware/validate");

router.get("/", async (req, res) => {
  const types = await Type.find().sort("name");
  res.send(types);
});

router.get("/:id", validateId, async (req, res) => {
  const type = await Type.findById(req.params.id);
  if (!type) return res.status(404).send("Type with the given ID not found.");
  res.send(type);
});

router.post("/", [auth, admin, inject(validate)], async (req, res) => {
  const { name, description, imgUrl } = req.body;
  const type = new Type({
    name,
    description,
    imgUrl,
  });

  try {
    await type.save();
    res.send(type);
  } catch (ex) {
    console.log(ex.message);
    res.status(500).send("Something failed.");
  }
});

router.put(
  "/:id",
  [validateId, auth, admin, inject(validate)],
  async (req, res) => {
    const { name, description, imgUrl } = req.body;

    try {
      const type = await Type.findOneAndUpdate(
        { _id: req.params.id },
        { name, description, imgUrl },
        { new: true }
      );
      if (!type)
        return res.status(404).send("Type with the given ID not found.");

      res.send(type);
    } catch (ex) {
      console.log(ex.message);
      res.status(500).send("Something failed.");
    }
  }
);

router.delete("/:id", [validateId, auth, admin], async (req, res) => {
  const type = await Type.findById(req.params.id);
  if (!type) return res.status(404).send("Type with the given ID not found.");

  if (type.models && type.models.length)
    return res.status(403).send("Could not delete types with models");

  await Type.deleteOne({ _id: req.params.id });

  res.send(type);
});

module.exports = router;
