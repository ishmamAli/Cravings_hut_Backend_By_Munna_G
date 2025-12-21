const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");
const mongoDuplicateKeyError = require("./../utils/MongoDuplicateKeyError");

const inventorySchema = mongoose.Schema(
  {
    itemName: { type: String, trim: true },
    quantity: { type: Number },
    unit: {
      type: String,
      enum: ["g", "kg", "ml", "l", "pcs"],
    },
    unitPrice: { type: Number },
    description: { type: String, trim: true },
    inventoryType: {
      type: String,
      enum: ["consumable", "nonconsumable"],
      default: "nonconsumable",
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

inventorySchema.index({ itemName: 1, inventoryType: 1 }, { unique: true });

// add plugin that converts mongoose to json
inventorySchema.plugin(toJSON);
inventorySchema.plugin(paginate);

mongoDuplicateKeyError(inventorySchema);

/**
 * @typedef Inventory
 */
const Inventory = mongoose.model("Inventory", inventorySchema);

module.exports = Inventory;
