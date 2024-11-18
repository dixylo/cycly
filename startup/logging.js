const winston = require("winston");
const config = require("config");
require("winston-mongodb");
require("express-async-errors");

module.exports = function () {
  const db = config.get("db");

  // Handle exceptions with updated transport configurations
  winston.exceptions.handle(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.prettyPrint()
      ),
    }),
    new winston.transports.File({ filename: "uncaughtExceptions.log" }),
    new winston.transports.MongoDB({ db })
  );

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (ex) => {
    throw ex;
  });

  // Add transports for logging
  winston.add(new winston.transports.File({ filename: "logfile.log" }));
  winston.add(new winston.transports.MongoDB({ db, level: "info" }));
};
