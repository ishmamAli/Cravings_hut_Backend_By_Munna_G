const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const wastageSchema = mongoose.Schema(
  {
    item: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory" },
    quantity: { type: Number },
    reason: { type: String, trim: true },
    date: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  },
);

// add plugin that converts mongoose to json
wastageSchema.plugin(toJSON);
wastageSchema.plugin(paginate);

/**
 * @typedef Wastage
 */
const Wastage = mongoose.model("Wastage", wastageSchema);

module.exports = Wastage;
