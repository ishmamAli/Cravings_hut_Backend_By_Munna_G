const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");
const mongoDuplicateKeyError = require("./../utils/MongoDuplicateKeyError");

const UNIT_GROUPS = {
  weight: ["g", "kg"],
  volume: ["ml", "l"],
  pcs: ["pcs"],
};

const getUnitGroup = (unit) => {
  if (UNIT_GROUPS.weight.includes(unit)) return "weight";
  if (UNIT_GROUPS.volume.includes(unit)) return "volume";
  if (UNIT_GROUPS.pcs.includes(unit)) return "pcs";
  return null;
};

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
    preparationCost: { type: Number },
    systemCost: { type: Number },
  },
  {
    timestamps: true,
  },
);

menuItemSchema.index({ name: 1, category: 1 }, { unique: true });

// add plugin that converts mongoose to json
menuItemSchema.plugin(toJSON);
menuItemSchema.plugin(paginate);

menuItemSchema.pre("save", async function (next) {
  try {
    const Inventory = mongoose.model("Inventory");

    if (!this.ingredients?.length) return next();

    for (const ing of this.ingredients) {
      const inventory = await Inventory.findById(ing.inventoryItem).lean();
      if (!inventory) continue;

      const groupA = getUnitGroup(ing.unit);
      const groupB = getUnitGroup(inventory.unit);

      if (!groupA || !groupB || groupA !== groupB) {
        return next(new Error(`Unit mismatch: ingredient (${ing.unit}) vs inventory (${inventory.unit})`));
      }
    }

    next();
  } catch (err) {
    next(err);
  }
});

mongoDuplicateKeyError(menuItemSchema);

/**
 * @typedef MenuItem
 */
const MenuItem = mongoose.model("MenuItem", menuItemSchema);

module.exports = MenuItem;
