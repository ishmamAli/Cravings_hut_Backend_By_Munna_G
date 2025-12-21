const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { toJSON, paginate } = require("./plugins");
const mongoDuplicateKeyError = require("./../utils/MongoDuplicateKeyError");

const userSchema = mongoose.Schema(
  {
    full_name: {
      type: String,
      trim: true,
    },
    email: {
      unique: true,
      type: String,
      trim: true,
    },
    profile_photo: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      trim: true,
    },
    user_type: {
      type: String,
      enum: ["superadmin", "user"],
      default: "user",
    },
    permission: { type: mongoose.Schema.Types.ObjectId, ref: "Permission" },
    createBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre("save", async function (next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, 10);
  }
  if (user?.email != null) {
    user.email = user.email.toLowerCase().replace(/\s/g, "");
  }
  next();
});

mongoDuplicateKeyError(userSchema);
/**
 * @typedef User
 */
const User = mongoose.model("User", userSchema);

module.exports = User;
