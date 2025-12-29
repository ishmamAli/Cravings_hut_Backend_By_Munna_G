const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const expenseSchema = mongoose.Schema(
  {
    name: { type: String, trim: true },
    amount: { type: Number },
    date: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
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
