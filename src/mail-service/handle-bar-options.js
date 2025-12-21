const path = require("path");

module.exports = {
  viewEngine: {
    partialsDir: path.resolve(__dirname + "/template"),
    defaultLayout: false,
  },
  viewPath: path.resolve(__dirname + "/template"),
};
