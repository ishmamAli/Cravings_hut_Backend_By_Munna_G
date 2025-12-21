const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");
const mongoDuplicateKeyError = require("./../utils/MongoDuplicateKeyError");

const menuItemSchema = mongoose.Schema(
  {
    name: { type: String, trim: true },
    price: { type: Number, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    isAvailable: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: {
      type: String,
      enum: ["item", "deal"],
      default: "item",
    },
    dealItems: [
      {
        item: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
        category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
        quantity: { type: Number, min: 1, default: 1 },
        _id: false,
      },
    ],
    ingredients: [
      {
        inventoryItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Inventory",
          required: true,
        },
        quantity: { type: Number, required: true }, // e.g. 100 (grams) or 2 (pieces)
        unit: { type: String, enum: ["g", "kg", "ml", "l", "pcs"], default: "g" }, // optional, just for info
        _id: false,
      },
    ],
  },
  {
    timestamps: true,
  }
);

menuItemSchema.index({ name: 1, category: 1 }, { unique: true });

// add plugin that converts mongoose to json
menuItemSchema.plugin(toJSON);
menuItemSchema.plugin(paginate);

mongoDuplicateKeyError(menuItemSchema);
/**
 * @typedef MenuItem
 */
const MenuItem = mongoose.model("MenuItem", menuItemSchema);

module.exports = MenuItem;
