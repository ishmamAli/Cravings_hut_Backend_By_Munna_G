const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");
const mongoDuplicateKeyError = require("./../utils/MongoDuplicateKeyError");

const categorySchema = mongoose.Schema(
  {
    name: {
      unique: true,
      type: String,
      required: true,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
categorySchema.plugin(toJSON);
categorySchema.plugin(paginate);

mongoDuplicateKeyError(categorySchema);
/**
 * @typedef Category
 */
const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
