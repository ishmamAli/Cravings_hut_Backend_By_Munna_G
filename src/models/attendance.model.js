// models/attendance.model.js
const mongoose = require("mongoose");
const { toJSON, paginate } = require("./plugins");

const attendanceSchema = mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmployeeProfile",
      required: true,
      index: true,
    },

    date: {
      type: Date,
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["present", "absent", "short_leave", "leave"],
      required: true,
    },

    checkIn: Date,
    checkOut: Date,

    notes: String,

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

// 🚀 prevent duplicate attendance per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

attendanceSchema.plugin(toJSON);
attendanceSchema.plugin(paginate);

const Attendance = mongoose.model("Attendance", attendanceSchema);

module.exports = Attendance;
