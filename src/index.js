const mongoose = require("mongoose");
const app = require("./app");
const config = require("./config/config");
const logger = require("./config/logger");
const http = require("http");
const { Server } = require("socket.io");

let server;

mongoose.set("strictQuery", true);

mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  logger.info("Connected to MongoDB");

  server = http.createServer(app);
  // ✅ create io AFTER server is created
  const io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || "*", // not `true`
      methods: ["GET", "POST", "PATCH"],
    },
  });

  // ✅ make io accessible to any route via req.app.get('io')
  app.set("io", io);

  io.on("connection", (socket) => {
    console.log("socket connected", socket.id);
  });
  // "0.0.0.0",
  server.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
  });
});

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info("Server closed");
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on("uncaughtException", unexpectedErrorHandler);
process.on("unhandledRejection", unexpectedErrorHandler);

process.on("SIGTERM", () => {
  logger.info("SIGTERM received");
  if (server) {
    server.close();
  }
});
