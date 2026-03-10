const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const oilSchema = mongoose.Schema(
  {
    source: {
      type: String,
      trim: true,
    },
    amount: {
      type: Number,
      min: 0,
    },
    quantity: {
      type: Number,
      min: 0,
    },
    oldQuantity: {
      type: Number,
      min: 0,
    },
    changeType: {
      type: String,
      enum: ["new", "replaced", "topped_up"],
    },
    changedAt: {
      type: Date,
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

// plugins
oilSchema.plugin(toJSON);
oilSchema.plugin(paginate);

oilSchema.index({ kitchen: 1, changedAt: -1 });

/**
 * @typedef Oil
 */
const Oil = mongoose.model("Oil", oilSchema);

module.exports = Oil;
