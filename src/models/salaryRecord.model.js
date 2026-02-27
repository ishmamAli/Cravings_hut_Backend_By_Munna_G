// models/salaryRecord.model.js
const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const salaryRecordSchema = mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmployeeProfile",
      required: true,
      index: true,
    },

    month: {
      type: Number, // 1–12
      required: true,
    },

    year: {
      type: Number,
      required: true,
    },

    basicSalary: Number,
    perDaySalary: Number,

    presentDays: Number,
    absentDays: Number,
    shortLeaves: Number,
    calculatedAbsentFromShort: Number,

    netPayable: Number,

    isPaid: {
      type: Boolean,
      default: false,
    },

    paidAt: Date,

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

salaryRecordSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

salaryRecordSchema.plugin(toJSON);
salaryRecordSchema.plugin(paginate);

const SalaryRecord = mongoose.model("SalaryRecord", salaryRecordSchema);

module.exports = SalaryRecord;
