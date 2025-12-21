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
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
orderSchema.plugin(toJSON);
orderSchema.plugin(paginate);

orderSchema.pre("save", async function (next) {
  const doc = this;

  if (doc.isNew) {
    try {
      const lastOrder = await this.constructor.findOne(
        { orderId: { $exists: true } },
        { orderId: 1 },
        { sort: { orderId: -1 } }
      );

      const newId = lastOrder && lastOrder.orderId ? lastOrder.orderId + 1 : 1;
      doc.orderId = newId;

      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

/**
 * @typedef Order
 */
const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
