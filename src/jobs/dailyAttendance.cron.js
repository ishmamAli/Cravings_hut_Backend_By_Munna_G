const cron = require("node-cron");
const moment = require("moment-timezone");
const { Attendance } = require("../models");
const { EmployeeProfile } = require("../models");
const ApiError = require("../utils/ApiError");

// 🔥 helper to get Karachi today range
const getTodayRangePKT = () => {
  const nowPKT = moment().tz("Asia/Karachi");

  return {
    start: nowPKT.clone().startOf("day").toDate(),
    end: nowPKT.clone().endOf("day").toDate(),
    todayMoment: nowPKT,
  };
};

const runDailyAttendance = async () => {
  try {
    console.log("⏰ Running daily attendance cron...");

    const { start, end, todayMoment } = getTodayRangePKT();

    // ✅ default times
    const checkInTime = todayMoment.clone().hour(8).minute(0).second(0);
    const checkOutTime = todayMoment.clone().hour(23).minute(0).second(0);

    // 🔥 get active employees
    const employees = await EmployeeProfile.find({
      isActive: true,
    }).select("_id");

    if (!employees.length) {
      console.log("⚠️ No active employees found");
      return;
    }

    for (const emp of employees) {
      // ✅ prevent duplicate attendance
      const alreadyMarked = await Attendance.findOne({
        employee: emp._id,
        date: { $gte: start, $lte: end },
      });

      if (alreadyMarked) continue;

      await Attendance.create({
        employee: emp._id,
        date: todayMoment.toDate(),
        status: "present",
        checkIn: checkInTime.toDate(),
        checkOut: checkOutTime.toDate(),
        notes: "Auto marked present",
        createdBy: null, // system generated
      });
    }

    console.log("✅ Daily attendance cron completed");
  } catch (error) {
    console.error("❌ Daily attendance cron failed:", error);
  }
};

// 🔥 schedule: 2:00 PM Asia/Karachi
const startDailyAttendanceCron = () => {
  cron.schedule(
    "0 14 * * *", // 14 = 2 PM
    runDailyAttendance,
    {
      timezone: "Asia/Karachi",
    },
  );
};

module.exports = startDailyAttendanceCron;
