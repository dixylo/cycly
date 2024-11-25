const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = function (req, res, next) {
  const token = req.header("Authorization").slice(7);
  if (!token) return res.status(401).send("Access denied. No token provided.");

  try {
    const payload = jwt.verify(token, config.get("jwtPrivateKey"));
    req.user = payload;
    next();
  } catch (ex) {
    res.status(400).send("Invalid token.");
  }
};
