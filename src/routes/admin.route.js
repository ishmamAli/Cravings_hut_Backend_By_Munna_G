const express = require("express");
const { requireSignin, adminMiddleware } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { adminValidation, commonValidation } = require("../validations");
const { adminController } = require("../controllers");
const router = express.Router();

router
  .route("/register")
  .post(requireSignin, adminMiddleware, validate(adminValidation.register), adminController.register);
router.route("/login").post(validate(adminValidation.login), adminController.login);
router
  .route("/reset-password")
  .patch(requireSignin, adminMiddleware, validate(adminValidation.resetPassword), adminController.resetPassword);
router
  .route("/category")
  .post(requireSignin, adminMiddleware, validate(adminValidation.categorySchema), adminController.createCategory)
  .get(adminController.getAllCategory);
router
  .route("/category/:ObjectId")
  .get(requireSignin, validate(commonValidation.singleObject), adminController.getCategoryById)
  .patch(requireSignin, validate(adminValidation.categorySchema), adminController.updateCategoryById)
  .delete(requireSignin, validate(commonValidation.singleObject), adminController.deleteCategoryById);
router
  .route("/menu-item")
  .post(requireSignin, adminMiddleware, validate(adminValidation.createMenuItem), adminController.createMenuItem)
  .get(requireSignin, adminMiddleware, adminController.getAllMenuItem);
router
  .route("/menu-item/:ObjectId")
  .get(requireSignin, validate(commonValidation.singleObject), adminController.getMenuItemById)
  .patch(requireSignin, validate(adminValidation.updateMenuItemById), adminController.updateMenuItemById)
  .delete(requireSignin, validate(commonValidation.singleObject), adminController.deleteMenuItemById);
router
  .route("/table")
  .post(requireSignin, adminMiddleware, validate(adminValidation.tableSchema), adminController.createTable)
  .get(requireSignin, adminMiddleware, adminController.getAllTable);
router
  .route("/table/:ObjectId")
  .get(requireSignin, validate(commonValidation.singleObject), adminController.getTableById)
  .patch(requireSignin, validate(adminValidation.tableSchema), adminController.updateTableById)
  .delete(requireSignin, validate(commonValidation.singleObject), adminController.deleteTableById);
router
  .route("/inventory")
  .post(requireSignin, adminMiddleware, validate(adminValidation.createInventory), adminController.createInventory)
  .get(requireSignin, adminMiddleware, adminController.getAllInventory);
router
  .route("/inventory/:ObjectId")
  .get(requireSignin, validate(commonValidation.singleObject), adminController.getInventoryById)
  .patch(requireSignin, validate(adminValidation.updateInventoryById), adminController.updateInventoryById)
  .delete(requireSignin, validate(commonValidation.singleObject), adminController.deleteInventoryById);
router
  .route("/expense")
  .post(requireSignin, adminMiddleware, validate(adminValidation.createExpense), adminController.createExpense)
  .get(requireSignin, adminMiddleware, adminController.getAllExpense);
router
  .route("/expense/:ObjectId")
  .get(requireSignin, validate(commonValidation.singleObject), adminController.getExpenseById)
  .patch(requireSignin, validate(adminValidation.updateExpenseById), adminController.updateExpenseById)
  .delete(requireSignin, validate(commonValidation.singleObject), adminController.deleteExpenseById);
router
  .route("/income")
  .post(requireSignin, adminMiddleware, validate(adminValidation.createIncome), adminController.createIncome)
  .get(requireSignin, adminMiddleware, adminController.getAllIncome);
router
  .route("/income/:ObjectId")
  .get(requireSignin, validate(commonValidation.singleObject), adminController.getIncomeById)
  .patch(requireSignin, validate(adminValidation.updateIncomeById), adminController.updateIncomeById)
  .delete(requireSignin, validate(commonValidation.singleObject), adminController.deleteIncomeById);
router
  .route("/supplier")
  .post(requireSignin, adminMiddleware, validate(adminValidation.createSupplier), adminController.createSupplier)
  .get(requireSignin, adminMiddleware, adminController.getAllSupplier);
router
  .route("/supplier/:ObjectId")
  .get(requireSignin, validate(commonValidation.singleObject), adminController.getSupplierById)
  .patch(requireSignin, validate(adminValidation.updateSupplierById), adminController.updateSupplierById)
  .delete(requireSignin, validate(commonValidation.singleObject), adminController.deleteSupplierById);
router.route("/order").get(requireSignin, adminController.getAllOrder);
module.exports = router;
