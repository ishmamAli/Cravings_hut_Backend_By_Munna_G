const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const expenseSchema = mongoose.Schema(
  {
    name: { type: String, trim: true },
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
expenseSchema.plugin(toJSON);
expenseSchema.plugin(paginate);

/**
 * @typedef Expense
 */
const Expense = mongoose.model("Expense", expenseSchema);

module.exports = Expense;
