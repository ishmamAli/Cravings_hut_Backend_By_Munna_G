const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const { userService } = require("../services");
const config = require("../config/config");
const pick = require("../utils/pick");
const MailerFacade = require("../mail-service/mailer-facade");
const MailTypes = require("../mail-service/mail-types");
const { User } = require("../models");

const register = catchAsync(async (req, res) => {
  let body = req.body;
  const user = await userService.register(body);
  // await MailerFacade.sendEmail(
  //   user?.email,
  //   "Suren - Welcome OnBoard",
  //   MailTypes.WelcomeEmail,
  //   [],
  //   [],
  //   user?.firstName + user?.lastName,
  //   user?.otp
  // );
  res.status(httpStatus.CREATED).send(user);
});

const login = catchAsync(async (req, res) => {
  let body = req.body;
  body.email = body.email.toLowerCase().replace(/\s/g, "");
  const user = await userService.login(body);
  res.status(httpStatus.CREATED).send(user);
});

const forgotPassword = catchAsync(async (req, res) => {
  let body = req.body;
  body.email = body.email.toLowerCase().replace(/\s/g, "");
  const result = await userService.forgotPassword(body);
  // if (body?.type === "resend") {
  //   await MailerFacade.sendEmail(
  //     result?.email,
  //     "Suren - Verification OTP",
  //     MailTypes.ForgotPassword,
  //     [],
  //     [],
  //     result?.firstName + result?.lastName,
  //     result?.otp,
  //     "verify your email"
  //   );
  // } else {
  //   await MailerFacade.sendEmail(
  //     result?.email,
  //     "Suren - Verification OTP",
  //     MailTypes.ForgotPassword,
  //     [],
  //     [],
  //     result?.firstName + result?.lastName,
  //     result?.otp,
  //     "reset your password"
  //   );
  // }

  res.status(httpStatus.CREATED).send(result);
});

const verifyOtp = catchAsync(async (req, res) => {
  let body = req.body;
  body.email = body.email.toLowerCase().replace(/\s/g, "");
  const result = await userService.verifyOtp(body);
  res.status(httpStatus.CREATED).send(result);
});

const changePassword = catchAsync(async (req, res) => {
  let body = req.body;
  const user = await userService.changePassword(body);
  res.status(httpStatus.CREATED).send(user);
});

const getUserById = catchAsync(async (req, res) => {
  let { ObjectId } = req.params;
  const user = await userService.getUserById(ObjectId);
  res.status(httpStatus.CREATED).send(user);
});

const updateUserById = catchAsync(async (req, res) => {
  let { ObjectId } = req.params;
  let body = req.body;
  if (req.file) {
    body.profilePicture = config?.rootPath + req.file.filename;
  }
  if (Object.keys(body).length === 0) {
    return res
      .status(httpStatus.BAD_REQUEST)
      .json({ message: '"body" must contain at least one of [firstName, lastName, phoneNumber,profilePicture]' });
  }
  const user = await userService.updateUserById(ObjectId, body);
  res.status(httpStatus.CREATED).send(user);
});

const deleteUserById = catchAsync(async (req, res) => {
  let { ObjectId } = req.params;
  const user = await userService.deleteUserById(ObjectId);
  res.status(httpStatus.CREATED).send(user);
});

const resetPassword = catchAsync(async (req, res) => {
  let body = req.body;
  const user = await userService.resetPassword(body);
  res.status(httpStatus.CREATED).send(user);
});

const addRolePermission = catchAsync(async (req, res) => {
  let body = req.body;
  const result = await userService.addRolePermission(body);
  res.status(httpStatus.CREATED).send(result);
});

module.exports = {
  register,
  login,
  forgotPassword,
  verifyOtp,
  changePassword,
  getUserById,
  updateUserById,
  deleteUserById,
  resetPassword,
  addRolePermission,
};
