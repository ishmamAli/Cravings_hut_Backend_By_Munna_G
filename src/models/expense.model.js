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
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "online"],
    },
  },
  {
    timestamps: true,
  },
);

// add plugin that converts mongoose to json
expenseSchema.plugin(toJSON);
expenseSchema.plugin(paginate);

// expense model
expenseSchema.index({ createdAt: -1 });
expenseSchema.index({ supplier: 1, createdAt: -1 });
expenseSchema.index({ paymentMethod: 1, createdAt: -1 });
expenseSchema.index({ name: 1 });

/**
 * @typedef Expense
 */
const Expense = mongoose.model("Expense", expenseSchema);

module.exports = Expense;
