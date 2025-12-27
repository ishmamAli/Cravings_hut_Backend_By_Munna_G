// models/order.model.js
const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const OrderItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },
    name: String,
    price: Number,
    qty: { type: Number, default: 1 },
    notes: String,

    // NEW: mark if this line is a deal
    isDeal: { type: Boolean, default: false },

    // NEW: optional breakdown of items included in the deal
    dealItems: [
      {
        menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
        name: String,
        qty: { type: Number, default: 1 },
      },
    ],
  },
  { _id: false }
);

const orderSchema = mongoose.Schema(
  {
    tableNumber: { type: String },
    items: [OrderItemSchema],
    status: {
      type: String,
      enum: ["PENDING", "IN_PROGRESS", "DONE"],
      default: "PENDING",
    },
    // only total, no subtotal
    total: Number,
    orderId: { type: Number },
    orderDay: { type: String },
    applyCgtTax: { type: Boolean, default: false },
    applyDiscount: { type: Boolean, default: false },
    cgtTax: { type: Number },
    discount: { type: Number },
    orderType: { type: String },
    cgtTaxPer: { type: Number },
    discountPer: { type: Number },
    endTime: { type: Date },
    customerName: { type: String },
    customerPhone: { type: String },
    customerAddress: { type: String },
    inventoryDeducted: { type: Boolean, default: false },
    inventoryDeductedAt: { type: Date },
    deliveryMode: {
      type: String,
    },
    kitchenSlipPrinted: { type: Boolean, default: false },
    kitchenSlipPrintedAt: { type: Date },
    kitchenSlipPrintCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({ orderDay: 1, orderId: 1 }, { unique: true });

// add plugin that converts mongoose to json
orderSchema.plugin(toJSON);
orderSchema.plugin(paginate);

orderSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  try {
    // Asia/Karachi is UTC+5 (no DST)
    const PKT_OFFSET_MS = 5 * 60 * 60 * 1000;

    const now = new Date();
    const pktNow = new Date(now.getTime() + PKT_OFFSET_MS);

    const y = pktNow.getUTCFullYear();
    const m = String(pktNow.getUTCMonth() + 1).padStart(2, "0");
    const d = String(pktNow.getUTCDate()).padStart(2, "0");

    // Karachi business day key
    this.orderDay = `${y}-${m}-${d}`;

    // Get last orderId for the same Karachi day
    const lastOrder = await this.constructor
      .findOne({ orderDay: this.orderDay }, { orderId: 1 }, { sort: { orderId: -1 } })
      .lean();

    this.orderId = lastOrder?.orderId ? lastOrder.orderId + 1 : 1;

    next();
  } catch (err) {
    next(err);
  }
});

/**
 * @typedef Order
 */
const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
