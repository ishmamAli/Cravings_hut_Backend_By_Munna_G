const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const incomeSchema = mongoose.Schema(
  {
    source: { type: String, trim: true },
    amount: { type: Number },
    date: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Buyer",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "online"],
      default: "cash",
    },
  },
  {
    timestamps: true,
  },
);

// add plugin that converts mongoose to json
incomeSchema.plugin(toJSON);
incomeSchema.plugin(paginate);

incomeSchema.pre("validate", function (next) {
  const hasSupplier = !!this.supplier;
  const hasBuyer = !!this.buyer;

  if ((hasSupplier && hasBuyer) || (!hasSupplier && !hasBuyer)) {
    return next(new Error("Income must have either supplier or buyer (only one)."));
  }

  next();
});

/**
 * @typedef Income
 */
const Income = mongoose.model("Income", incomeSchema);

module.exports = Income;
