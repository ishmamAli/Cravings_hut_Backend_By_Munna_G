const express = require("express");
const { requireSignin } = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const { permissionValidation } = require("../validations");
const { permissionController } = require("../controllers");
const router = express.Router();

router
  .route("/")
  .post(requireSignin, validate(permissionValidation.createPermission), permissionController.createPermission)
  .get(requireSignin, permissionController.getAllPermission);

router
  .route("/:permissionId")
  .get(requireSignin, validate(permissionValidation.getPermissionById), permissionController.getPermissionById)
  .patch(requireSignin, validate(permissionValidation.updatePermissionById), permissionController.updatePermissionById);
// .delete(
//   requireSignin,
//   validate(permissionValidation.deletePermissionById),
//   permissionController.deletePermissionById
// );
router
  .route("/by/role-name")
  .get(
    requireSignin,
    validate(permissionValidation.getPermssionByRoleName),
    permissionController.getPermssionByRoleName
  );
module.exports = router;
