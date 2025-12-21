const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");
const mongoDuplicateKeyError = require("./../utils/MongoDuplicateKeyError");

const permissionSchema = mongoose.Schema(
  {
    role: {
      unique: true,
      type: String,
      required: true,
    },
    privilege: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
permissionSchema.plugin(toJSON);
permissionSchema.plugin(paginate);

mongoDuplicateKeyError(permissionSchema);
/**
 * @typedef Permission
 */
const Permission = mongoose.model("Permission", permissionSchema);

module.exports = Permission;
