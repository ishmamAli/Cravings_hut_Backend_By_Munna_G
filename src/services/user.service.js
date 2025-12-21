const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const { User, Permission } = require("../models");
const generateJwtToken = require("../config/generateToken");
const { generateOTP } = require("../utils/utils");
const bcrypt = require("bcryptjs");

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
    if (user?.user_type != "user") {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid Permission");
    }
    const accessToken = generateJwtToken(user._id, "user");
    let metaInfo = { profile: user, email: user?.email, user_type: "user" };
    const result = { token: accessToken, meta_data: metaInfo };
    return result;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const forgotPassword = async (body) => {
  try {
    let userEmail = await User.findOne({ email: body.email });
    if (!userEmail) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No user found");
    }
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 5);
    const otp = generateOTP();
    userEmail.otp = otp;
    userEmail.expiry = expiry;
    await userEmail.save();
    return userEmail;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const verifyOtp = async (body) => {
  try {
    let result = await User.findOne({ $and: [{ email: body.email }, { otp: body.otp }] }).populate("permission");
    if (!result) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP");
    }

    if (result.expiry < new Date()) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Otp has been expired");
    }
    result.accountVerified = true;
    await result.save();
    const accessToken = generateJwtToken(result._id, result.role);
    const finalResult = { accessToken, user: result };
    return finalResult;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const changePassword = async (body) => {
  try {
    const hashPassword = await bcrypt.hash(body.password, 10);
    const user = await User.findOneAndUpdate(
      { _id: body.userId },
      {
        $set: { password: hashPassword },
      },
      { new: true }
    );
    if (!user) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No student found");
    }
    return user;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const getUserById = async (id) => {
  try {
    let user = await User.findById(id);
    if (user) {
      let finalResult = { profile: user, email: user?.email, user_type: user?.user_type };
      return finalResult;
    }
    return user;
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const updateUserById = async (id, body) => {
  try {
    let user = await User.findById(id);
    if (!user) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No user found");
    }
    Object.assign(user, body);
    return await user.save();
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

const deleteUserById = async (id) => {
  try {
    const user = await User.findByIdAndRemove(id);
    if (!user) {
      throw new ApiError(httpStatus.BAD_REQUEST, "No user found");
    }
    return "Delete successfully";
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
      { new: true }
    );
    return updateUser;
  } catch (error) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error);
  }
};

const addRolePermission = async (body) => {
  try {
    return await Permission.create(body);
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

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
