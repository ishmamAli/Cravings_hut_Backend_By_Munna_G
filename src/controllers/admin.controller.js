const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { adminService } = require("../services");
const pick = require("../utils/pick");

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
  let options = pick(req.query, ["limit", "page"]);
  options.sortBy = "createdAt:desc";
  options.populate = "createdBy,updatedBy";
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
  options.populate = "createdBy,updatedBy";
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
  let filter = {};
  let options = pick(req.query, ["limit", "page"]);
  if (req.query.status && req.query.type) {
    filter = { status: req.query.status, orderType: req.query.type };
  } else if (req.query.status) {
    filter = { status: req.query.status };
  } else if (req.query.type) {
    filter = { orderType: req.query.type };
  }
  const result = await adminService.getAllOrder(filter, options);
  res.status(httpStatus.CREATED).send(result);
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
};
