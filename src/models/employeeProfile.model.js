const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const employeeProfileSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    employeeId: {
      type: String,
      trim: true,
      unique: true,
    },

    designation: {
      type: String,
      trim: true,
    },

    department: {
      type: String,
      trim: true,
    },

    joiningDate: {
      type: Date,
      required: true,
    },

    basicSalary: {
      type: Number,
      required: true,
      min: 0,
    },

    workingDaysPerMonth: {
      type: Number,
      default: 28,
    },

    shortLeavePenaltyRatio: {
      type: Number,
      default: 2, // 🔥 2 short leaves = 1 absent
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

employeeProfileSchema.plugin(toJSON);
employeeProfileSchema.plugin(paginate);

employeeProfileSchema.pre("validate", async function (next) {
  try {
    if (this.employeeId) return next();

    const Model = this.constructor;

    // find last employee
    const lastEmployee = await Model.findOne({}, {}, { sort: { createdAt: -1 } }).lean();

    let nextNumber = 1;

    if (lastEmployee?.employeeId) {
      const lastNum = parseInt(lastEmployee.employeeId.replace(/\D/g, ""), 10);
      nextNumber = lastNum + 1;
    }

    // format → EMP0001
    this.employeeId = `EMP${String(nextNumber).padStart(4, "0")}`;

    next();
  } catch (error) {
    next(error);
  }
});

const EmployeeProfile = mongoose.model("EmployeeProfile", employeeProfileSchema);

module.exports = EmployeeProfile;
