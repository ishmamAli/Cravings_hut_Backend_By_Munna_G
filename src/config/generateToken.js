const jwt = require("jsonwebtoken");

const generateJwtToken = (_id, role) => {
  return jwt.sign({ _id, role }, process.env.JWT_SECRET, {
    expiresIn: "1y",
  });
};

module.exports = generateJwtToken;
