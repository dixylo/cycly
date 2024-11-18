const express = require("express");
const cors = require("cors");
const home = require("../routes/home");
const auth = require("../routes/auth");
const users = require("../routes/users");
const cycles = require("../routes/cycles");
const brands = require("../routes/brands");
const types = require("../routes/types");
const models = require("../routes/models");
const rentals = require("../routes/rentals");
const returns = require("../routes/returns");
const error = require("../middleware/error");

module.exports = function (app) {
  app.use(express.json());
  app.use(cors({ exposedHeaders: ["Authorization"] }));
  app.use("/", home);
  app.use("/api/auth", auth);
  app.use("/api/users", users);
  app.use("/api/cycles", cycles);
  app.use("/api/brands", brands);
  app.use("/api/types", types);
  app.use("/api/models", models);
  app.use("/api/rentals", rentals);
  app.use("/api/returns", returns);
  app.use(error);
};
