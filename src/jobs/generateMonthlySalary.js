const cron = require("node-cron");
const moment = require("moment-timezone");
const { EmployeeProfile, Attendance, SalaryRecord } = require("../models");
const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");

/**
 * Generates monthly salary for a single employee
 */
const generateSalaryForEmployee = async (employee, month, year, userId) => {
  try {
    const start = moment()
      .year(year)
      .month(month - 1)
      .startOf("month");

    const end = moment(start).endOf("month");

    const attendance = await Attendance.find({
      employee: employee._id,
      date: { $gte: start.toDate(), $lte: end.toDate() },
    });

    let present = 0,
      absent = 0,
      shortLeave = 0;

    attendance.forEach((a) => {
      if (a.status === "present") present++;
      if (a.status === "absent") absent++;
      if (a.status === "short_leave") shortLeave++;
    });

    // 2 short leaves = 1 absent
    const extraAbsent = Math.floor(shortLeave / employee.shortLeavePenaltyRatio);
    const totalAbsent = absent + extraAbsent;

    const perDaySalary = employee.basicSalary / employee.workingDaysPerMonth;
    const netPayable = employee.basicSalary - totalAbsent * perDaySalary;

    // Check if salary record exists for same month/year
    const existingSalary = await SalaryRecord.findOne({
      employee: employee._id,
      month,
      year,
    });

    if (existingSalary) {
      // Update existing salary
      return await SalaryRecord.findByIdAndUpdate(
        existingSalary._id,
        {
          basicSalary: employee.basicSalary,
          perDaySalary,
          presentDays: present,
          absentDays: absent,
          shortLeaves: shortLeave,
          calculatedAbsentFromShort: extraAbsent,
          netPayable,
          updatedBy: userId,
        },
        { new: true },
      );
    }

    // Create new salary
    return await SalaryRecord.create({
      employee: employee._id,
      month,
      year,
      basicSalary: employee.basicSalary,
      perDaySalary,
      presentDays: present,
      absentDays: absent,
      shortLeaves: shortLeave,
      calculatedAbsentFromShort: extraAbsent,
      netPayable,
      createdBy: userId,
    });
  } catch (error) {
    console.error("Salary generation failed for", employee._id, error);
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

/**
 * Cron Job: Run daily at 1 PM Asia/Karachi
 */
const generateSalary = () => {
  cron.schedule(
    "0 13 * * *",
    async () => {
      console.log("🔥 Running monthly salary generator:", new Date());

      try {
        const today = moment().tz("Asia/Karachi");
        const month = today.month() + 1; // Jan = 0
        const year = today.year();

        // Get all active employees
        const employees = await EmployeeProfile.find({ isActive: true });

        for (const emp of employees) {
          await generateSalaryForEmployee(emp, month, year, null); // null = system-generated
        }

        console.log("✅ Monthly salary generation completed for all employees");
      } catch (err) {
        console.error("❌ Error in salary cron job:", err);
      }
    },
    {
      timezone: "Asia/Karachi",
    },
  );
};

module.exports = generateSalary;
