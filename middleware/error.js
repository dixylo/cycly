const winston = require("winston");

module.exports = function (err, req, res, next) {
  winston.log({
    level: "error",
    message: err.message,
    stack: err.stack,
  });

  res.status(500).send("Something failed.");
};
