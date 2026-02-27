const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const kitchenInventorySchema = mongoose.Schema(
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
kitchenInventorySchema.plugin(toJSON);
kitchenInventorySchema.plugin(paginate);

/**
 * @typedef KitchenInventory
 */
const KitchenInventory = mongoose.model("KitchenInventory", kitchenInventorySchema);

module.exports = KitchenInventory;
