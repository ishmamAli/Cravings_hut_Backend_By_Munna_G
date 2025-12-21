const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const OrderInventoryLogSchema = mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    orderId: { type: Number }, // snapshot (your auto orderId)

    action: {
      type: String,
      enum: ["DECREMENT"],
      default: "DECREMENT",
    },

    // who marked DONE (optional, but useful)
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    // detailed per inventory item result
    entries: [
      {
        inventoryItem: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory" },
        inventoryName: String,

        inventoryUnit: { type: String, enum: ["g", "kg", "ml", "l", "pcs"] },

        requiredQty: Number, // required in inventoryUnit (summed)
        deductedQty: Number, // actual deducted in inventoryUnit

        beforeQty: Number,
        afterQty: Number,

        skipped: { type: Boolean, default: false },
        reason: String, // e.g. NOT_FOUND / INSUFFICIENT / UNIT_MISMATCH / INVALID_QTY
      },
    ],

    summary: {
      updated: { type: Number, default: 0 },
      skipped: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// only one decrement log per order
OrderInventoryLogSchema.index({ order: 1, action: 1 }, { unique: true });

OrderInventoryLogSchema.plugin(toJSON);
OrderInventoryLogSchema.plugin(paginate);

const OrderInventoryLog = mongoose.model("OrderInventoryLog", OrderInventoryLogSchema);
module.exports = OrderInventoryLog;
