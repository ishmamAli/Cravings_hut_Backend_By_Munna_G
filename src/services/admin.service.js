const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const {
  User,
  Permission,
  Category,
  MenuItem,
  Table,
  Inventory,
  Expense,
  Income,
  Order,
  Supplier,
  Wastage,
  KitchenInventory,
  Buyer,
  Oil,
  EmployeeProfile,
  Attendance,
  SalaryRecord,
} = require("../models");
const generateJwtToken = require("../config/generateToken");
const { generateOTP } = require("../utils/utils");
const bcrypt = require("bcryptjs");
const moment = require("moment");

/**
 * Create
 * @param {Object} userBody
 * @returns {Promise<User>}
 */

const register = async (body) => {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 5);
  const otp = generateOTP();
  body.otp = otp;
  body.expiry = expiry;
  try {
    let permissionFound = await Permission.findOne({ role: body?.role });
    if (permissionFound) {
      body.permission = permissionFound?._id;
    }
    return await User.create(body);
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const login = async (body) => {
  try {
    let user = await User.findOne({
      email: body.email,
    }).populate("permission");
    if (!user) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Credentials invalid");
    }
    const checkPassword = await user.isPasswordMatch(body.password);
    if (!checkPassword) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Credentials invalid");
    }
    if (user?.user_type != "superadmin") {
      throw new ApiError(httpStatus.BAD_REQUEST, "Only Super admin Can Access");
    }
    const accessToken = generateJwtToken(user._id, "superadmin");
    let metaInfo = { profile: user, email: user?.email, user_type: "superadmin" };
    const result = { token: accessToken, meta_data: metaInfo };
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const resetPassword = async (body) => {
  try {
    const user = await User.findById(body?.userId);
    if (!user) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No user found");
    }
    const checkPassword = await user.isPasswordMatch(body?.oldPassword);
    if (!checkPassword) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid old password");
    }

    const hashPassword = await bcrypt.hash(body.newPassword, 10);
    const updateUser = User.findOneAndUpdate(
      { _id: body?.userId },
      { $set: { password: hashPassword } },
      { new: true },
    );
    return updateUser;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const createCategory = async (body) => {
  try {
    return await Category.create(body);
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const getAllCategory = async (filter, options) => {
  try {
    return await Category.paginate(filter, options);
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const getCategoryById = async (id) => {
  try {
    const category = await Category.findById(id);
    if (!category) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No category found");
    }
    return category;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const updateCategoryById = async (id, updateBody) => {
  try {
    const category = await Category.findById(id);
    if (!category) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No category found");
    }
    Object.assign(category, updateBody);
    await category.save();
    return category;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const deleteCategoryById = async (id) => {
  try {
    const category = await Category.findByIdAndRemove(id);
    if (!category) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No category found");
    }
    return "Delete successfully";
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const createMenuItem = async (body) => {
  try {
    return await MenuItem.create(body);
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const getAllMenuItem = async (filter, options) => {
  try {
    return await MenuItem.paginate(filter, options);
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const getMenuItemById = async (id) => {
  try {
    const result = await MenuItem.findById(id);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No menu item found");
    }
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const updateMenuItemById = async (id, updateBody) => {
  try {
    const result = await MenuItem.findById(id);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No menu item found");
    }
    Object.assign(result, updateBody);
    await result.save();
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const deleteMenuItemById = async (id) => {
  try {
    const result = await MenuItem.findByIdAndRemove(id);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No menu item found");
    }
    return "Delete successfully";
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const createTable = async (body) => {
  try {
    return await Table.create(body);
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const getAllTable = async (filter, options) => {
  try {
    return await Table.paginate(filter, options);
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const getTableById = async (id) => {
  try {
    const result = await Table.findById(id);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No table found");
    }
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const updateTableById = async (id, updateBody) => {
  try {
    const result = await Table.findById(id);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No table found");
    }
    Object.assign(result, updateBody);
    await result.save();
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const deleteTableById = async (id) => {
  try {
    const result = await Table.findByIdAndRemove(id);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No table found");
    }
    return "Delete successfully";
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const createInventory = async (body) => {
  try {
    return await Inventory.create(body);
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const getAllInventory = async (filter, options) => {
  try {
    return await Inventory.paginate(filter, options);
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const getInventoryById = async (id) => {
  try {
    const result = await Inventory.findById(id);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No inventory found");
    }
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const updateInventoryById = async (id, updateBody) => {
  try {
    const result = await Inventory.findById(id);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No inventory found");
    }
    Object.assign(result, updateBody);
    await result.save();
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const deleteInventoryById = async (id) => {
  try {
    const result = await Inventory.findByIdAndRemove(id);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No inventory found");
    }
    return "Delete successfully";
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const createExpense = async (body) => {
  try {
    return await Expense.create(body);
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const getAllExpense = async (filter, options) => {
  try {
    const paginated = await Expense.paginate(filter, options);
    const totalAgg = await Expense.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: { $ifNull: ["$amount", 0] } },
        },
      },
    ]);

    const totalExpenseAmount = totalAgg?.[0]?.totalAmount || 0;

    return {
      ...paginated,
      totalExpenseAmount,
    };
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const getExpenseById = async (id) => {
  try {
    const result = await Expense.findById(id);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No expense found");
    }
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const updateExpenseById = async (id, updateBody) => {
  try {
    const result = await Expense.findById(id);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No expense found");
    }
    Object.assign(result, updateBody);
    await result.save();
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const deleteExpenseById = async (id) => {
  try {
    const result = await Expense.findByIdAndRemove(id);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No expense found");
    }
    return "Delete successfully";
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const createIncome = async (body) => {
  try {
    return await Income.create(body);
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const getAllIncome = async (filter, options) => {
  try {
    return await Income.paginate(filter, options);
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const getIncomeById = async (id) => {
  try {
    const result = await Income.findById(id);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No income found");
    }
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const updateIncomeById = async (id, updateBody) => {
  try {
    const result = await Income.findById(id);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No income found");
    }
    Object.assign(result, updateBody);
    await result.save();
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const deleteIncomeById = async (id) => {
  try {
    const result = await Income.findByIdAndRemove(id);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No income found");
    }
    return "Delete successfully";
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const getAllOrder = async (filter, options) => {
  try {
    options.populate = "items.menuItem.category,items.dealItems.menuItem.category";

    options.sort = { createdAt: -1 };
    return await Order.paginate(filter, options);
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const createSupplier = async (body) => {
  try {
    return await Supplier.create(body);
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const getAllSupplier = async (filter, options) => {
  try {
    return await Supplier.paginate(filter, options);
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const getSupplierById = async (id) => {
  try {
    const result = await Supplier.findById(id);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No supplier found");
    }
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const updateSupplierById = async (id, updateBody) => {
  try {
    const result = await Supplier.findById(id);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No supplier found");
    }
    Object.assign(result, updateBody);
    await result.save();
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const deleteSupplierById = async (id) => {
  try {
    const result = await Supplier.findByIdAndRemove(id);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No supplier found");
    }
    return "Delete successfully";
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const addWastage = async (body, userId) => {
  try {
    const { item, quantity, reason, date } = body;

    // 1) Find inventory item
    const inventory = await Inventory.findById(item);
    if (!inventory) {
      throw new ApiError(httpStatus.NOT_FOUND, "Inventory item not found");
    }

    // 2) Validate quantity
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid wastage quantity");
    }

    // ✅ 3) Ensure enough Kitchen stock (kitchenQuantity)
    const kitchenQty = Number(inventory.kitchenQuantity ?? 0);
    if (kitchenQty < qty) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Not enough kitchen stock. Available: ${kitchenQty}, Requested: ${qty}`,
      );
    }

    // 4) Create wastage
    const [wastage] = await Wastage.create([
      {
        item,
        quantity: qty,
        reason,
        date,
        createdBy: userId,
        updatedBy: userId,
      },
    ]);

    // ✅ 5) Decrease kitchenQuantity (NOT quantity)
    inventory.kitchenQuantity = kitchenQty - qty;

    inventory.updatedBy = userId;
    await inventory.save();

    return wastage;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error?.message || "Failed to add wastage");
  }
};

const getAllWastage = async (filter, options) => {
  try {
    return await Wastage.paginate(filter, options);
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const addPreparationCostForMenu = async (body) => {
  try {
    let result = await MenuItem.findByIdAndUpdate(
      body?.menuItemId,
      { $set: { preparationCost: body?.preparationCost } },
      { new: true },
    );
    if (!result) {
      throw new ApiError(httpStatus.NOT_FOUND, "Menu item not found");
    }
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const assignKitchenInventory = async (body, userId) => {
  try {
    const { item, quantity, reason, date } = body;

    // 2) Validate quantity
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid quantity");
    }

    // 3) Atomic update: decrease quantity & increase kitchenQuantity
    //    Also ensures enough stock using quantity: { $gte: qty }
    const updatedInventory = await Inventory.findOneAndUpdate(
      { _id: item, quantity: { $gte: qty } },
      {
        $inc: { quantity: -qty, kitchenQuantity: qty },
        $set: { updatedBy: userId },
      },
      { new: true },
    );

    if (!updatedInventory) {
      const inv = await Inventory.findById(item).lean();
      if (!inv) {
        throw new ApiError(httpStatus.NOT_FOUND, "Inventory item not found");
      }
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        `Not enough stock. Available: ${inv.quantity ?? 0}, Requested: ${qty}`,
      );
    }

    // 4) Create KitchenInventory record
    let kitchenEntry;
    try {
      kitchenEntry = await KitchenInventory.create({
        item,
        quantity: qty,
        reason,
        date: date ? new Date(date) : new Date(),
        createdBy: userId,
        updatedBy: userId,
      });
    } catch (createErr) {
      // 5) Rollback inventory update if kitchen record fails
      await Inventory.updateOne(
        { _id: item },
        {
          $inc: { quantity: qty, kitchenQuantity: -qty },
          $set: { updatedBy: userId },
        },
      );

      throw createErr;
    }

    return {
      kitchenEntry,
      inventory: updatedInventory,
    };
  } catch (error) {
    if (error?.statusCode) throw error;
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error?.message || "Failed to assign kitchen inventory");
  }
};

const getAllKitchenInventory = async (filter, options) => {
  try {
    return await KitchenInventory.paginate(filter, options);
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const createBuyer = async (body) => {
  try {
    return await Buyer.create(body);
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const getAllBuyer = async (filter, options) => {
  try {
    return await Buyer.paginate(filter, options);
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const getBuyerById = async (id) => {
  try {
    const result = await Buyer.findById(id);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No buyer found");
    }
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const updateBuyerById = async (id, updateBody) => {
  try {
    const result = await Buyer.findById(id);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No buyer found");
    }
    Object.assign(result, updateBody);
    await result.save();
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const deleteBuyerById = async (id) => {
  try {
    const result = await Buyer.findByIdAndRemove(id);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No buyer found");
    }
    return "Delete successfully";
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const createOil = async (body) => {
  try {
    return await Oil.create(body);
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const getAllOil = async (filter, options) => {
  try {
    return await Oil.paginate(filter, options);
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const getOilById = async (id) => {
  try {
    const result = await Oil.findById(id);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No oil found");
    }
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const updateOilById = async (id, updateBody) => {
  try {
    const result = await Oil.findById(id);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No oil found");
    }
    Object.assign(result, updateBody);
    await result.save();
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const deleteOilById = async (id) => {
  try {
    const result = await Oil.findByIdAndRemove(id);
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No oil found");
    }
    return "Delete successfully";
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const createEmployeeProfile = async (body) => {
  try {
    return await EmployeeProfile.create(body);
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const getEmployees = async (filter, options) => {
  try {
    return await EmployeeProfile.paginate(filter, options);
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const markAttendance = async (body) => {
  try {
    return await Attendance.create(body);
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const getAttendance = async (filter, options) => {
  try {
    return await Attendance.paginate(filter, options);
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const generateMonthlySalary = async (employeeId, month, year, userId) => {
  try {
    const employee = await EmployeeProfile.findById(employeeId);

    const start = moment()
      .year(year)
      .month(month - 1)
      .startOf("month");

    const end = moment(start).endOf("month");

    const attendance = await Attendance.find({
      employee: employeeId,
      date: { $gte: start.toDate(), $lte: end.toDate() },
    });

    let present = 0;
    let absent = 0;
    let shortLeave = 0;

    attendance.forEach((a) => {
      if (a.status === "present") present++;
      if (a.status === "absent") absent++;
      if (a.status === "short_leave") shortLeave++;
    });

    // 🔥 2 short = 1 absent
    const extraAbsent = Math.floor(shortLeave / employee.shortLeavePenaltyRatio);

    const totalAbsent = absent + extraAbsent;

    const perDaySalary = employee.basicSalary / employee.workingDaysPerMonth;

    const netPayable = employee.basicSalary - totalAbsent * perDaySalary;

    return SalaryRecord.create({
      employee: employeeId,
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
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const getSalaries = async (filter, options) => {
  try {
    return await SalaryRecord.paginate(filter, options);
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

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
  generateMonthlySalary,
  getSalaries,
};
