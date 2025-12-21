const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");
const mongoDuplicateKeyError = require("./../utils/MongoDuplicateKeyError");

const supplierSchema = mongoose.Schema(
  {
    name: { type: String, unique: true, trim: true },
    address: { type: String, trim: true },
    contactNumber: { type: String, trim: true },
    email: { type: String, trim: true },
    faxNumber: { type: String, trim: true },
    resourcePerson: { type: String, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
supplierSchema.plugin(toJSON);
supplierSchema.plugin(paginate);

mongoDuplicateKeyError(supplierSchema);

/**
 * @typedef Supplier
 */
const Supplier = mongoose.model("Supplier", supplierSchema);

module.exports = Supplier;
