const express = require("express");
const { requireSignin, adminMiddleware } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const userValidation = require("../validations/user.validation");
const commonValidation = require("../validations/common.validation");
const { userController } = require("../controllers");
const { imageUpload } = require("../utils/fileUpload");
const router = express.Router();

router.route("/register").post(validate(userValidation.register), userController.register);
router.route("/login").post(validate(userValidation.login), userController.login);
router.route("/forgot/password").post(validate(userValidation.forgotPassword), userController.forgotPassword);
router.route("/verify/otp").post(validate(userValidation.verifyOtp), userController.verifyOtp);
router.route("/change/password").patch(validate(userValidation.changePassword), userController.changePassword);
router.route("/reset/password").patch(validate(userValidation.resetPassword), userController.resetPassword);
router
  .route("/by/id/:ObjectId")
  .get(validate(commonValidation.singleObject), userController.getUserById)
  .patch(
    requireSignin,
    imageUpload.single("profilePicture"),
    validate(userValidation.updateUserById),
    userController.updateUserById
  )
  .delete(requireSignin, validate(commonValidation.singleObject), userController.deleteUserById);
router
  .route("/add/role-permission")
  .post(requireSignin, adminMiddleware, validate(userValidation.addRolePermission), userController.addRolePermission);
module.exports = router;
