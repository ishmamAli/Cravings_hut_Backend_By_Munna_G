const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");
const mongoDuplicateKeyError = require("./../utils/MongoDuplicateKeyError");

const buyerSchema = mongoose.Schema(
  {
    name: { type: String, unique: true, trim: true },
    address: { type: String, trim: true },
    contactNumber: { type: String, trim: true },
    idCardNumber: { type: String, trim: true },
    email: { type: String, trim: true },
    faxNumber: { type: String, trim: true },
    resourcePerson: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  },
);

// add plugin that converts mongoose to json
buyerSchema.plugin(toJSON);
buyerSchema.plugin(paginate);

mongoDuplicateKeyError(buyerSchema);

/**
 * @typedef Buyer
 */
const Buyer = mongoose.model("Buyer", buyerSchema);

module.exports = Buyer;
