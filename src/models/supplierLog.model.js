const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const supplierLogSchema = mongoose.Schema(
  {
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },

    // ❌ make old single-item fields OPTIONAL (for backward compatibility)
    inventoryItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Inventory",
      required: false,
    },
    quantity: { type: Number, required: false },
    unit: {
      type: String,
      enum: ["g", "kg", "ml", "l", "pcs"],
      required: false,
    },
    rate: { type: Number, required: false },
    totalAmount: { type: Number, required: false },

    // ✅ NEW: multiple items per bill
    items: [
      {
        inventoryItem: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Inventory",
          required: true,
        },
        quantity: { type: Number, required: true },
        unit: {
          type: String,
          enum: ["g", "kg", "ml", "l", "pcs"],
          required: true,
        },
        rate: { type: Number, required: true },
        totalAmount: { type: Number, required: true },
      },
    ],

    // ✅ full bill total
    grandTotal: { type: Number },

    paymentMethod: {
      type: String,
      enum: ["cash", "credit"],
      required: true,
    },

    // root-level bill meta
    billId: { type: String, trim: true },
    paymentDate: { type: Date },
    remarks: { type: String, trim: true },

    // these now represent the split of grandTotal
    cashAmount: { type: Number },
    creditAmount: { type: Number },

    // (optional legacy)
    credit: {
      billId: { type: String, trim: true },
      amount: { type: Number },
      date: { type: Date },
      remarks: { type: String, trim: true },
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

supplierLogSchema.plugin(toJSON);
supplierLogSchema.plugin(paginate);

const SupplierLog = mongoose.model("SupplierLog", supplierLogSchema);

module.exports = SupplierLog;
