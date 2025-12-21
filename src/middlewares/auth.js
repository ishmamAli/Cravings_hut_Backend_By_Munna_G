const httpStatus = require("http-status");
const jwt = require("jsonwebtoken");
const ApiError = require("./../utils/ApiError");
const config = require("./../config/config");

const requireSignin = (req, res, next) => {
  if (req.headers.authorization) {
    const token = req.headers.authorization.split(" ")[1];
    const user = jwt.verify(token, config.jwt.secret);
    req.user = user;
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, "Authorization required");
  }
  next();
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== "superadmin") {
    throw new ApiError(httpStatus.BAD_REQUEST, "Only Super admin Can Access");
  }
  next();
};

module.exports = {
  requireSignin,
  adminMiddleware,
};
