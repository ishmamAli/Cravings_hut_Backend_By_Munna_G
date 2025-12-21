const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const incomeSchema = mongoose.Schema(
  {
    source: { type: String, trim: true },
    amount: { type: Number },
    date: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
incomeSchema.plugin(toJSON);
incomeSchema.plugin(paginate);

/**
 * @typedef Income
 */
const Income = mongoose.model("Income", incomeSchema);

module.exports = Income;
