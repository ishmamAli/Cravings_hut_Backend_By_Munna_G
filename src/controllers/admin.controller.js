const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { adminService } = require("../services");
const pick = require("../utils/pick");
const moment = require("moment-timezone");
const { Expense, EmployeeProfile } = require("../models");
const mongoose = require("mongoose");

const register = catchAsync(async (req, res) => {
  let body = req.body;
  const user = await adminService.register(body);
  res.status(httpStatus.CREATED).send(user);
});

const login = catchAsync(async (req, res) => {
  let body = req.body;
  body.email = body.email.toLowerCase().replace(/\s/g, "");
  const user = await adminService.login(body);
  res.status(httpStatus.CREATED).send(user);
});

const resetPassword = catchAsync(async (req, res) => {
  let body = req.body;
  const user = await adminService.resetPassword(body);
  res.status(httpStatus.CREATED).send(user);
});

const createCategory = catchAsync(async (req, res) => {
  let body = req.body;
  let { _id } = req.user;
  body.createdBy = _id;
  const result = await adminService.createCategory(body);
  res.status(httpStatus.CREATED).send(result);
});

const getAllCategory = catchAsync(async (req, res) => {
  let filter = {};
  let options = pick(req.query, ["limit", "page"]);
  if (req.query.type) {
    options.sortBy = "name:asec";
  } else {
    options.sortBy = "createdAt:desc";
  }
  options.populate = "createdBy,updatedBy";
  const result = await adminService.getAllCategory(filter, options);
  res.status(httpStatus.CREATED).send(result);
});

const getCategoryById = catchAsync(async (req, res) => {
  let id = req.params.ObjectId;
  const category = await adminService.getCategoryById(id);
  res.status(httpStatus.CREATED).send(category);
});
const updateCategoryById = catchAsync(async (req, res) => {
  let id = req.params.ObjectId;
  let body = req.body;
  let { _id } = req.user;
  body.updatedBy = _id;
  const category = await adminService.updateCategoryById(id, body);
  res.status(httpStatus.CREATED).send(category);
});

const deleteCategoryById = catchAsync(async (req, res) => {
  let id = req.params.ObjectId;
  const category = await adminService.deleteCategoryById(id);
  res.status(httpStatus.CREATED).send(category);
});

const createMenuItem = catchAsync(async (req, res) => {
  let body = req.body;
  let { _id } = req.user;
  body.createdBy = _id;
  const result = await adminService.createMenuItem(body);
  res.status(httpStatus.CREATED).send(result);
});

const getAllMenuItem = catchAsync(async (req, res) => {
  let filter = {};
  let options = pick(req.query, ["limit", "page"]);
  options.sortBy = "createdAt:desc";
  options.populate = "category,createdBy,updatedBy";
  const result = await adminService.getAllMenuItem(filter, options);
  res.status(httpStatus.CREATED).send(result);
});

const getMenuItemById = catchAsync(async (req, res) => {
  let id = req.params.ObjectId;
  const result = await adminService.getMenuItemById(id);
  res.status(httpStatus.CREATED).send(result);
});

const updateMenuItemById = catchAsync(async (req, res) => {
  let id = req.params.ObjectId;
  let body = req.body;
  let { _id } = req.user;
  body.updatedBy = _id;
  const result = await adminService.updateMenuItemById(id, body);
  res.status(httpStatus.CREATED).send(result);
});

const deleteMenuItemById = catchAsync(async (req, res) => {
  let id = req.params.ObjectId;
  const result = await adminService.deleteMenuItemById(id);
  res.status(httpStatus.CREATED).send(result);
});

const createTable = catchAsync(async (req, res) => {
  let body = req.body;
  let { _id } = req.user;
  body.createdBy = _id;
  const result = await adminService.createTable(body);
  res.status(httpStatus.CREATED).send(result);
});

const getAllTable = catchAsync(async (req, res) => {
  let filter = {};
  let options = pick(req.query, ["limit", "page"]);
  options.sortBy = "createdAt:desc";
  options.populate = "createdBy,updatedBy";
  const result = await adminService.getAllTable(filter, options);
  res.status(httpStatus.CREATED).send(result);
});

const getTableById = catchAsync(async (req, res) => {
  let id = req.params.ObjectId;
  const result = await adminService.getTableById(id);
  res.status(httpStatus.CREATED).send(result);
});

const updateTableById = catchAsync(async (req, res) => {
  let id = req.params.ObjectId;
  let body = req.body;
  let { _id } = req.user;
  body.updatedBy = _id;
  const result = await adminService.updateTableById(id, body);
  res.status(httpStatus.CREATED).send(result);
});

const deleteTableById = catchAsync(async (req, res) => {
  let id = req.params.ObjectId;
  const result = await adminService.deleteTableById(id);
  res.status(httpStatus.CREATED).send(result);
});

const createInventory = catchAsync(async (req, res) => {
  let body = req.body;
  let { _id } = req.user;
  body.createdBy = _id;
  const result = await adminService.createInventory(body);
  res.status(httpStatus.CREATED).send(result);
});

const getAllInventory = catchAsync(async (req, res) => {
  let filter = {};
  let options = pick(req.query, ["limit", "page"]);
  options.sortBy = "createdAt:desc";
  options.populate = "createdBy,updatedBy";
  const result = await adminService.getAllInventory(filter, options);
  res.status(httpStatus.CREATED).send(result);
});

const getInventoryById = catchAsync(async (req, res) => {
  let id = req.params.ObjectId;
  const result = await adminService.getInventoryById(id);
  res.status(httpStatus.CREATED).send(result);
});

const updateInventoryById = catchAsync(async (req, res) => {
  let id = req.params.ObjectId;
  let body = req.body;
  let { _id } = req.user;
  body.updatedBy = _id;
  const result = await adminService.updateInventoryById(id, body);
  res.status(httpStatus.CREATED).send(result);
});

const deleteInventoryById = catchAsync(async (req, res) => {
  let id = req.params.ObjectId;
  const result = await adminService.deleteInventoryById(id);
  res.status(httpStatus.CREATED).send(result);
});

const createExpense = catchAsync(async (req, res) => {
  let body = req.body;
  let { _id } = req.user;
  body.createdBy = _id;
  const result = await adminService.createExpense(body);
  res.status(httpStatus.CREATED).send(result);
});

const getAllExpense = catchAsync(async (req, res) => {
  let filter = {};
  const { search, paymentMethod, supplier } = req.query;
  // Search by name (case-insensitive)
  if (search && String(search).trim()) {
    const s = String(search).trim();
    // Escape regex special chars to avoid regex injection / bad patterns
    const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.name = { $regex: escaped, $options: "i" };
  }
  // Filter by paymentMethod
  if (paymentMethod && ["cash", "online"].includes(paymentMethod)) {
    filter.paymentMethod = paymentMethod;
  }
  // Filter by supplier (ObjectId)
  if (supplier && mongoose.Types.ObjectId.isValid(supplier)) {
    filter.supplier = new mongoose.Types.ObjectId(supplier);
  }
  let options = pick(req.query, ["limit", "page"]);
  options.sortBy = "createdAt:desc";
  options.populate = "createdBy,updatedBy,supplier";
  const result = await adminService.getAllExpense(filter, options);
  res.status(httpStatus.CREATED).send(result);
});

const getExpenseById = catchAsync(async (req, res) => {
  let id = req.params.ObjectId;
  const result = await adminService.getExpenseById(id);
  res.status(httpStatus.CREATED).send(result);
});

const updateExpenseById = catchAsync(async (req, res) => {
  let id = req.params.ObjectId;
  let body = req.body;
  let { _id } = req.user;
  body.updatedBy = _id;
  const result = await adminService.updateExpenseById(id, body);
  res.status(httpStatus.CREATED).send(result);
});

const deleteExpenseById = catchAsync(async (req, res) => {
  let id = req.params.ObjectId;
  const result = await adminService.deleteExpenseById(id);
  res.status(httpStatus.CREATED).send(result);
});

const createIncome = catchAsync(async (req, res) => {
  let body = req.body;
  let { _id } = req.user;
  body.createdBy = _id;
  const result = await adminService.createIncome(body);
  res.status(httpStatus.CREATED).send(result);
});

const getAllIncome = catchAsync(async (req, res) => {
  let filter = {};
  let options = pick(req.query, ["limit", "page"]);
  options.sortBy = "createdAt:desc";
  options.populate = "createdBy,updatedBy,buyer,supplier";
  const result = await adminService.getAllIncome(filter, options);
  res.status(httpStatus.CREATED).send(result);
});

const getIncomeById = catchAsync(async (req, res) => {
  let id = req.params.ObjectId;
  const result = await adminService.getIncomeById(id);
  res.status(httpStatus.CREATED).send(result);
});

const updateIncomeById = catchAsync(async (req, res) => {
  let id = req.params.ObjectId;
  let body = req.body;
  let { _id } = req.user;
  body.updatedBy = _id;
  const result = await adminService.updateIncomeById(id, body);
  res.status(httpStatus.CREATED).send(result);
});

const deleteIncomeById = catchAsync(async (req, res) => {
  let id = req.params.ObjectId;
  const result = await adminService.deleteIncomeById(id);
  res.status(httpStatus.CREATED).send(result);
});

const getAllOrder = catchAsync(async (req, res) => {
  const options = pick(req.query, ["limit", "page"]);
  const filter = {};
  let expenseFilter = {};

  if (req.query.status) filter.status = req.query.status;
  if (req.query.type) {
    const type = String(req.query.type).trim();

    if (type === "deliverySelf") {
      filter.orderType = "delivery";
      filter.deliveryMode = "self";
    } else if (type === "campusBite") {
      filter.orderType = "delivery";
      filter.deliveryMode = "campusBite";
    } else {
      filter.orderType = type; // dinein, takeaway
    }
  }

  const viewer = (req.query.viewer || "").toLowerCase();
  const isUserView = viewer === "user";

  const tz = "Asia/Karachi";
  const businessStartHour = 8;

  const qStart = req.query.startDate;
  const qEnd = req.query.endDate;

  // 🟢 determine base date (business aware)
  const now = moment().tz(tz);
  let baseDate = qStart || qEnd || now.format("YYYY-MM-DD");

  // 🔥 CRITICAL FIX
  // If current time is BEFORE business start hour,
  // treat it as previous business day
  if (!qStart && !qEnd && isUserView && now.hour() < businessStartHour) {
    baseDate = now.subtract(1, "day").format("YYYY-MM-DD");
    const start = moment.tz(baseDate, "YYYY-MM-DD", tz).startOf("day").add(businessStartHour, "hours");

    const endExclusive = start.clone().add(1, "day");

    filter.createdAt = {
      $gte: start.toDate(),
      $lt: endExclusive.toDate(),
    };
    expenseFilter.date = {
      $gte: start.toDate(),
      $lt: endExclusive.toDate(),
    };
  } else if (qStart && qEnd) {
    const start = moment.tz(qStart, "YYYY-MM-DD", tz).startOf("day");
    const end = moment.tz(qEnd, "YYYY-MM-DD", tz).endOf("day");

    filter.createdAt = {
      $gte: start.toDate(),
      $lte: end.toDate(),
    };
    expenseFilter.date = {
      $gte: start.toDate(),
      $lte: end.toDate(),
    };
  } else if (isUserView) {
    const start = moment.tz(baseDate, "YYYY-MM-DD", tz).startOf("day").add(businessStartHour, "hours");

    const endExclusive = start.clone().add(1, "day");

    filter.createdAt = {
      $gte: start.toDate(),
      $lt: endExclusive.toDate(),
    };
    expenseFilter.date = {
      $gte: start.toDate(),
      $lt: endExclusive.toDate(),
    };
  }
  let result = await adminService.getAllOrder(filter, options);

  let totalSale = 0;
  let campusBiteTotalSale = 0;
  let campusBiteOrderCount = 0;
  if (result?.results?.length > 0) {
    // totalSale = result.results.reduce((sum, o) => sum + (Number(o?.total) || 0), 0);
    result.results.forEach((order) => {
      const amount = Number(order?.total) || 0;

      // ✅ overall sale
      totalSale += amount;

      // ✅ campus bite only
      if (order?.orderType === "delivery" && order?.deliveryMode === "campusBite") {
        campusBiteTotalSale += amount;
        campusBiteOrderCount += 1;
      }
    });
  }

  const expenseAgg = await Expense.aggregate([
    { $match: expenseFilter },
    { $match: { paymentMethod: "cash" } }, // ✅ only cash expenses
    {
      $group: {
        _id: null,
        totalExpense: { $sum: "$amount" },
      },
    },
  ]);

  const totalExpense = expenseAgg.length > 0 ? expenseAgg[0].totalExpense : 0;

  res.status(httpStatus.OK).send({
    ...result,
    totalSale,
    campusBiteTotalSale,
    campusBiteOrderCount,
    totalExpense,
  });
});

const createSupplier = catchAsync(async (req, res) => {
  let body = req.body;
  let { _id } = req.user;
  body.createdBy = _id;
  const result = await adminService.createSupplier(body);
  res.status(httpStatus.CREATED).send(result);
});

const getAllSupplier = catchAsync(async (req, res) => {
  let filter = {};
  let options = pick(req.query, ["limit", "page"]);
  options.sortBy = "createdAt:desc";
  options.populate = "createdBy,updatedBy";
  const result = await adminService.getAllSupplier(filter, options);
  res.status(httpStatus.CREATED).send(result);
});

const getSupplierById = catchAsync(async (req, res) => {
  let id = req.params.ObjectId;
  const result = await adminService.getSupplierById(id);
  res.status(httpStatus.CREATED).send(result);
});

const updateSupplierById = catchAsync(async (req, res) => {
  let id = req.params.ObjectId;
  let body = req.body;
  let { _id } = req.user;
  body.updatedBy = _id;
  const result = await adminService.updateSupplierById(id, body);
  res.status(httpStatus.CREATED).send(result);
});

const deleteSupplierById = catchAsync(async (req, res) => {
  let id = req.params.ObjectId;
  const result = await adminService.deleteSupplierById(id);
  res.status(httpStatus.CREATED).send(result);
});

const addWastage = catchAsync(async (req, res) => {
  let body = req.body;
  let { _id } = req.user;
  const result = await adminService.addWastage(body, _id);
  res.status(httpStatus.CREATED).send(result);
});

const getAllWastage = catchAsync(async (req, res) => {
  let filter = {};
  let options = pick(req.query, ["limit", "page"]);
  options.sortBy = "createdAt:desc";
  options.populate = "item,createdBy,updatedBy";
  const result = await adminService.getAllWastage(filter, options);
  res.status(httpStatus.CREATED).send(result);
});

const addPreparationCostForMenu = catchAsync(async (req, res) => {
  let body = req.body;
  const result = await adminService.addPreparationCostForMenu(body);
  res.status(httpStatus.CREATED).send(result);
});

const assignKitchenInventory = catchAsync(async (req, res) => {
  let body = req.body;
  let { _id } = req.user;
  const result = await adminService.assignKitchenInventory(body, _id);
  res.status(httpStatus.CREATED).send(result);
});

const getAllKitchenInventory = catchAsync(async (req, res) => {
  let filter = {};
  let options = pick(req.query, ["limit", "page"]);
  options.sortBy = "createdAt:desc";
  options.populate = "item,createdBy,updatedBy";
  const result = await adminService.getAllKitchenInventory(filter, options);
  res.status(httpStatus.CREATED).send(result);
});

const createBuyer = catchAsync(async (req, res) => {
  let body = req.body;
  let { _id } = req.user;
  body.createdBy = _id;
  const result = await adminService.createBuyer(body);
  res.status(httpStatus.CREATED).send(result);
});

const getAllBuyer = catchAsync(async (req, res) => {
  let filter = {};
  let options = pick(req.query, ["limit", "page"]);
  options.sortBy = "createdAt:desc";
  options.populate = "createdBy,updatedBy";
  const result = await adminService.getAllBuyer(filter, options);
  res.status(httpStatus.CREATED).send(result);
});

const getBuyerById = catchAsync(async (req, res) => {
  let id = req.params.ObjectId;
  const result = await adminService.getBuyerById(id);
  res.status(httpStatus.CREATED).send(result);
});

const updateBuyerById = catchAsync(async (req, res) => {
  let id = req.params.ObjectId;
  let body = req.body;
  let { _id } = req.user;
  body.updatedBy = _id;
  const result = await adminService.updateBuyerById(id, body);
  res.status(httpStatus.CREATED).send(result);
});

const deleteBuyerById = catchAsync(async (req, res) => {
  let id = req.params.ObjectId;
  const result = await adminService.deleteBuyerById(id);
  res.status(httpStatus.CREATED).send(result);
});

const createOil = catchAsync(async (req, res) => {
  let body = req.body;
  let { _id } = req.user;
  body.createdBy = _id;
  const result = await adminService.createOil(body);
  res.status(httpStatus.CREATED).send(result);
});

const getAllOil = catchAsync(async (req, res) => {
  let filter = {};
  let options = pick(req.query, ["limit", "page"]);
  options.sortBy = "createdAt:desc";
  options.populate = "createdBy,updatedBy";
  const result = await adminService.getAllOil(filter, options);
  res.status(httpStatus.CREATED).send(result);
});

const getOilById = catchAsync(async (req, res) => {
  let id = req.params.ObjectId;
  const result = await adminService.getOilById(id);
  res.status(httpStatus.CREATED).send(result);
});

const updateOilById = catchAsync(async (req, res) => {
  let id = req.params.ObjectId;
  let body = req.body;
  let { _id } = req.user;
  body.updatedBy = _id;
  const result = await adminService.updateOilById(id, body);
  res.status(httpStatus.CREATED).send(result);
});

const deleteOilById = catchAsync(async (req, res) => {
  let id = req.params.ObjectId;
  const result = await adminService.deleteOilById(id);
  res.status(httpStatus.CREATED).send(result);
});

const createEmployeeProfile = catchAsync(async (req, res) => {
  const body = req.body;
  body.createdBy = req.user._id;

  const result = await adminService.createEmployeeProfile(body);
  res.status(httpStatus.CREATED).send(result);
});

const getEmployees = catchAsync(async (req, res) => {
  let filter = {};
  let options = pick(req.query, ["limit", "page"]);
  options.sortBy = "createdAt:desc";
  options.populate = "createdBy,updatedBy,user";
  const result = await adminService.getEmployees(filter, options);
  res.send(result);
});

const markAttendance = catchAsync(async (req, res) => {
  const body = req.body;
  body.createdBy = req.user._id;

  const result = await adminService.markAttendance(body);
  res.status(httpStatus.CREATED).send(result);
});

const getAttendance = catchAsync(async (req, res) => {
  let filter = {};
  let options = pick(req.query, ["limit", "page"]);
  options.sortBy = "createdAt:desc";
  options.populate = "createdBy,updatedBy,employee,employee.user";
  if (req.query.user) {
    const employees = await EmployeeProfile.find({
      user: req.query.user,
    }).select("_id");

    filter.employee = {
      $in: employees.map((e) => e._id),
    };
  }
  if (req.query.fromDate || req.query.toDate) {
    filter.date = {};

    if (req.query.fromDate) {
      filter.date.$gte = new Date(req.query.fromDate);
    }

    if (req.query.toDate) {
      filter.date.$lte = new Date(req.query.toDate);
    }
  }
  const result = await adminService.getAttendance(filter, options);
  res.send(result);
});

const generateSalary = catchAsync(async (req, res) => {
  const result = await adminService.generateMonthlySalary(
    req.body.employeeId,
    req.body.month,
    req.body.year,
    req.user._id,
  );

  res.status(httpStatus.CREATED).send(result);
});

const getSalaries = catchAsync(async (req, res) => {
  let filter = {};
  let options = pick(req.query, ["limit", "page"]);
  options.sortBy = "createdAt:desc";
  options.populate = "employee,employee.user";
  const result = await adminService.getSalaries(filter, options);
  res.send(result);
});

const getAllOrders = catchAsync(async (req, res) => {
  const options = pick(req.query, ["limit", "page"]);
  const filter = {};
  let expenseFilter = {};

  if (req.query.status) filter.status = req.query.status;
  if (req.query.type) filter.orderType = req.query.type;

  const viewer = (req.query.viewer || "").toLowerCase();
  const isUserView = viewer === "user";

  const tz = "Asia/Karachi";
  const businessStartHour = 8;

  const qStart = req.query.startDate;
  const qEnd = req.query.endDate;

  // 🟢 determine base date (business aware)
  const now = moment().tz(tz);
  let baseDate = qStart || qEnd || now.format("YYYY-MM-DD");

  // 🔥 CRITICAL FIX
  // If current time is BEFORE business start hour,
  // treat it as previous business day
  if (!qStart && !qEnd && isUserView && now.hour() < businessStartHour) {
    baseDate = now.subtract(1, "day").format("YYYY-MM-DD");
    const start = moment.tz(baseDate, "YYYY-MM-DD", tz).startOf("day").add(businessStartHour, "hours");

    const endExclusive = start.clone().add(1, "day");

    filter.createdAt = {
      $gte: start.toDate(),
      $lt: endExclusive.toDate(),
    };
    expenseFilter.date = {
      $gte: start.toDate(),
      $lt: endExclusive.toDate(),
    };
  } else if (qStart && qEnd) {
    const start = moment.tz(qStart, "YYYY-MM-DD", tz).startOf("day");
    const end = moment.tz(qEnd, "YYYY-MM-DD", tz).endOf("day");

    filter.createdAt = {
      $gte: start.toDate(),
      $lte: end.toDate(),
    };
    expenseFilter.date = {
      $gte: start.toDate(),
      $lte: end.toDate(),
    };
  } else if (isUserView) {
    const start = moment.tz(baseDate, "YYYY-MM-DD", tz).startOf("day").add(businessStartHour, "hours");

    const endExclusive = start.clone().add(1, "day");

    filter.createdAt = {
      $gte: start.toDate(),
      $lt: endExclusive.toDate(),
    };
    expenseFilter.date = {
      $gte: start.toDate(),
      $lt: endExclusive.toDate(),
    };
  }
  let result = await adminService.getAllOrders(filter, options);

  let totalSale = 0;
  let campusBiteTotalSale = 0;
  let campusBiteOrderCount = 0;
  if (result?.results?.length > 0) {
    // totalSale = result.results.reduce((sum, o) => sum + (Number(o?.total) || 0), 0);
    result.results.forEach((order) => {
      const amount = Number(order?.total) || 0;

      // ✅ overall sale
      totalSale += amount;

      // ✅ campus bite only
      if (order?.orderType === "delivery" && order?.deliveryMode === "campusBite") {
        campusBiteTotalSale += amount;
        campusBiteOrderCount += 1;
      }
    });
  }

  const expenseAgg = await Expense.aggregate([
    { $match: expenseFilter },
    { $match: { paymentMethod: "cash" } }, // ✅ only cash expenses
    {
      $group: {
        _id: null,
        totalExpense: { $sum: "$amount" },
      },
    },
  ]);

  const totalExpense = expenseAgg.length > 0 ? expenseAgg[0].totalExpense : 0;

  res.status(httpStatus.OK).send({
    ...result,
    totalSale,
    campusBiteTotalSale,
    campusBiteOrderCount,
    totalExpense,
  });
});

module.exports = {
  register,
  login,
  resetPassword,
  createCategory,
  getAllCategory,
  getCategoryById,
  updateCategoryById,
  deleteCategoryById,
  createMenuItem,
  getAllMenuItem,
  getMenuItemById,
  updateMenuItemById,
  deleteMenuItemById,
  createTable,
  getAllTable,
  getTableById,
  updateTableById,
  deleteTableById,
  createInventory,
  getAllInventory,
  getInventoryById,
  updateInventoryById,
  deleteInventoryById,
  createExpense,
  getAllExpense,
  getExpenseById,
  updateExpenseById,
  deleteExpenseById,
  createIncome,
  getAllIncome,
  getIncomeById,
  updateIncomeById,
  deleteIncomeById,
  getAllOrder,
  createSupplier,
  getAllSupplier,
  getSupplierById,
  updateSupplierById,
  deleteSupplierById,
  addWastage,
  getAllWastage,
  addPreparationCostForMenu,
  assignKitchenInventory,
  getAllKitchenInventory,
  createBuyer,
  getAllBuyer,
  getBuyerById,
  updateBuyerById,
  deleteBuyerById,
  createOil,
  getAllOil,
  getOilById,
  updateOilById,
  deleteOilById,
  createEmployeeProfile,
  getEmployees,
  markAttendance,
  getAttendance,
  generateSalary,
  getSalaries,
  getAllOrders,
};
