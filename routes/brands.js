const _ = require("lodash");
const express = require("express");
const router = express.Router();
const { Brand, validate } = require("../models/brand");
const validateId = require("../middleware/validateId");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const inject = require("../middleware/validate");

router.get("/", async (req, res) => {
  const brands = await Brand.find().sort("name");

  res.send(brands);
});

router.get("/:id", validateId, async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) return res.status(404).send("Brand with the given ID not found.");

  res.send(brand);
});

router.post("/", [auth, admin, inject(validate)], async (req, res) => {
  const { name, description, country, phone, homepage, imgUrl } = req.body;
  const brand = new Brand({
    name,
    description,
    country,
    phone,
    homepage,
    imgUrl,
  });

  try {
    await brand.save();
    res.send(brand);
  } catch (ex) {
    console.log(ex.message);
    res.status(500).send("Something failed.");
  }
});

router.put(
  "/:id",
  [validateId, auth, admin, inject(validate)],
  async (req, res) => {
    const { name, description, country, phone, homepage, imgUrl } = req.body;

    try {
      const brand = await Brand.findOneAndUpdate(
        { _id: req.params.id },
        { name, description, country, phone, homepage, imgUrl },
        { new: true }
      );
      if (!brand)
        return res.status(404).send("Brand with the given ID not found.");

      res.send(brand);
    } catch (ex) {
      console.log(ex.message);
      res.status(500).send("Something failed.");
    }
  }
);

router.delete("/:id", [validateId, auth, admin], async (req, res) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) return res.status(404).send("Brand with the given ID not found.");

  if (brand.models && brand.models.length)
    return res.status(403).send("Could not delete brands with models");

  await Brand.deleteOne({ _id: req.params.id });

  res.send(brand);
});

module.exports = router;
