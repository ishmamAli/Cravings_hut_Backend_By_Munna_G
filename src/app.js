const express = require("express");
const xss = require("xss-clean");
const mongoSanitize = require("express-mongo-sanitize");
const compression = require("compression");
const cors = require("cors");
const httpStatus = require("http-status");
const config = require("./config/config");
const morgan = require("./config/morgan");
const { authLimiter } = require("./middlewares/rateLimiter");
const logRequest = require("./middlewares/logRequest");
const routes = require("./routes");
const { errorConverter, errorHandler, wrongJwtToken, singleImageRequired } = require("./middlewares/error");
const ApiError = require("./utils/ApiError");

const app = express();

if (config.env !== "test") {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// Middleware
app.use(express.json({ limit: "500mb" })); // parse json request body
app.use(express.urlencoded({ limit: "500mb", extended: true })); // parse urlencoded request body
app.use(xss()); // sanitize request data
app.use(mongoSanitize()); // sanitize request data
app.use(compression()); // gzip compression

// Enable CORS
app.use(cors());
app.options("*", cors());

if (config.env === "production") {
  app.use("/auth", authLimiter); // limit repeated failed requests to auth endpoints
}

app.use(logRequest);

// Serve static files from 'public/uploads'
app.use("//uploads", express.static("public/uploads"));

app.get("//health", (req, res) => res.sendStatus(200));

// API routes
app.use(routes);

// Handle unknown API requests
app.use((req, res, next) => {
  if (req.url === "/favicon.ico") {
    return res.status(204).end(); // No content
  }
  console.error(`404 Error - API Not found: ${req.method} ${req.url}`);
  next(new ApiError(httpStatus.BAD_REQUEST, "API Not found"));
});

// Error handling middleware
app.use(errorConverter);
app.use(wrongJwtToken);
app.use(singleImageRequired);
app.use(errorHandler);

module.exports = app;
