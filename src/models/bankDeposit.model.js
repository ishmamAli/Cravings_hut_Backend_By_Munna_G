const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");
const mongoDuplicateKeyError = require("./../utils/MongoDuplicateKeyError");

const bankDepositSchema = mongoose.Schema(
  {
    businessDate: { type: Date, required: true, index: true }, // "YYYY-MM-DD"
    amount: { type: Number, required: true },
    bankName: { type: String, default: "" },
    referenceNo: { type: String, default: "" },
    notes: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

bankDepositSchema.index({ businessDate: 1 }, { unique: true });

// add plugin that converts mongoose to json
bankDepositSchema.plugin(toJSON);
bankDepositSchema.plugin(paginate);

mongoDuplicateKeyError(bankDepositSchema);

/**
 * @typedef BankDeposit
 */
const BankDeposit = mongoose.model("BankDeposit", bankDepositSchema);

module.exports = BankDeposit;
