const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");
const mongoDuplicateKeyError = require("./../utils/MongoDuplicateKeyError");

const tableSchema = mongoose.Schema(
  {
    number: { unique: true, type: String, required: true },
    status: { type: String, enum: ["FREE", "OCCUPIED"], default: "FREE" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
tableSchema.plugin(toJSON);
tableSchema.plugin(paginate);

mongoDuplicateKeyError(tableSchema);

/**
 * @typedef Table
 */
const Table = mongoose.model("Table", tableSchema);

module.exports = Table;
