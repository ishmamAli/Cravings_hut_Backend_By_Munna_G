const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");
const mongoDuplicateKeyError = require("./../utils/MongoDuplicateKeyError");

const cashOpeningSchema = mongoose.Schema(
  {
    businessDate: { type: Date, required: true, index: true }, // "YYYY-MM-DD"
    amount: { type: Number, required: true, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

cashOpeningSchema.index({ businessDate: 1 }, { unique: true });

// add plugin that converts mongoose to json
cashOpeningSchema.plugin(toJSON);
cashOpeningSchema.plugin(paginate);

mongoDuplicateKeyError(cashOpeningSchema);

/**
 * @typedef CashOpening
 */
const CashOpening = mongoose.model("CashOpening", cashOpeningSchema);

module.exports = CashOpening;
