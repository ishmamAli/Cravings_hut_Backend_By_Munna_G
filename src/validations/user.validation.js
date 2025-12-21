const Joi = require("joi");
const { objectId } = require("./custom.validation");

const register = {
  body: Joi.object().keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().required(),
    countryCode: Joi.string().required(),
    password: Joi.string()
      .min(8) // Minimum 8 characters
      .max(32) // Maximum 32 characters
      .required() // Password is required
      .pattern(/[A-Z]/, "uppercase") // Must contain at least one uppercase letter
      .pattern(/[a-z]/, "lowercase") // Must contain at least one lowercase letter
      .pattern(/[0-9]/, "number") // Must contain at least one number
      .pattern(/[@$!%*?&]/, "special character") // Must contain at least one special character
      .messages({
        "string.min": "password must be at least 8 characters long",
        "string.max": "password must not exceed 32 characters",
        "string.pattern.name": "password must contain at least one {#name}",
        "any.required": "password is required",
      }),
    role: Joi.string().required().valid("buildingAdmin", "subBuildingAdmin", "installer"),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(8) // Minimum 8 characters
      .max(32) // Maximum 32 characters
      .required() // Password is required
      .pattern(/[A-Z]/, "uppercase") // Must contain at least one uppercase letter
      .pattern(/[a-z]/, "lowercase") // Must contain at least one lowercase letter
      .pattern(/[0-9]/, "number") // Must contain at least one number
      .pattern(/[@$!%*?&]/, "special character") // Must contain at least one special character
      .messages({
        "string.min": "password must be at least 8 characters long",
        "string.max": "password must not exceed 32 characters",
        "string.pattern.name": "password must contain at least one {#name}",
        "any.required": "password is required",
      }),
  }),
};

const forgotPassword = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    type: Joi.string().required().valid("resend", "forgot"),
  }),
};

const verifyOtp = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    otp: Joi.number().required(),
  }),
};

const changePassword = {
  body: Joi.object().keys({
    userId: Joi.required().custom(objectId),
    password: Joi.string()
      .min(8) // Minimum 8 characters
      .max(32) // Maximum 32 characters
      .required() // Password is required
      .pattern(/[A-Z]/, "uppercase") // Must contain at least one uppercase letter
      .pattern(/[a-z]/, "lowercase") // Must contain at least one lowercase letter
      .pattern(/[0-9]/, "number") // Must contain at least one number
      .pattern(/[@$!%*?&]/, "special character") // Must contain at least one special character
      .messages({
        "string.min": "Password must be at least 8 characters long",
        "string.max": "Password must not exceed 32 characters",
        "string.pattern.name": "Password must contain at least one {#name}",
        "any.required": "Password is required",
      }),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
      "any.only": "Confirm password does not match password",
    }),
  }),
};

const updateUserById = {
  params: Joi.object().keys({
    ObjectId: Joi.required().custom(objectId),
  }),
  body: Joi.object().keys({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    phoneNumber: Joi.string().optional(),
    countryCode: Joi.string().optional(),
  }),
  // .or("firstName", "lastName", "phoneNumber"),
};

const resetPassword = {
  body: Joi.object().keys({
    userId: Joi.required().custom(objectId),
    oldPassword: Joi.string()
      .min(8) // Minimum 8 characters
      .max(32) // Maximum 32 characters
      .required() // Password is required
      .pattern(/[A-Z]/, "uppercase") // Must contain at least one uppercase letter
      .pattern(/[a-z]/, "lowercase") // Must contain at least one lowercase letter
      .pattern(/[0-9]/, "number") // Must contain at least one number
      .pattern(/[@$!%*?&]/, "special character") // Must contain at least one special character
      .messages({
        "string.min": "old Password must be at least 8 characters long",
        "string.max": "old Password must not exceed 32 characters",
        "string.pattern.name": "old Password must contain at least one {#name}",
        "any.required": "oldPassword is required",
      }),
    newPassword: Joi.string()
      .min(8) // Minimum 8 characters
      .max(32) // Maximum 32 characters
      .required() // Password is required
      .pattern(/[A-Z]/, "uppercase") // Must contain at least one uppercase letter
      .pattern(/[a-z]/, "lowercase") // Must contain at least one lowercase letter
      .pattern(/[0-9]/, "number") // Must contain at least one number
      .pattern(/[@$!%*?&]/, "special character") // Must contain at least one special character
      .messages({
        "string.min": "new Password must be at least 8 characters long",
        "string.max": "new Password must not exceed 32 characters",
        "string.pattern.name": "new Password must contain at least one {#name}",
        "any.required": "newPassword is required",
      }),
    confirmPassword: Joi.string().valid(Joi.ref("newPassword")).required().messages({
      "any.only": "Confirm password does not match password",
    }),
  }),
};

const addUserByBuildingAdmin = {
  body: Joi.object().keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    role: Joi.string().required().valid("buildingAdmin", "subBuildingAdmin", "installer"),
    password: Joi.string()
      .min(8) // Minimum 8 characters
      .max(32) // Maximum 32 characters
      .required() // Password is required
      .pattern(/[A-Z]/, "uppercase") // Must contain at least one uppercase letter
      .pattern(/[a-z]/, "lowercase") // Must contain at least one lowercase letter
      .pattern(/[0-9]/, "number") // Must contain at least one number
      .pattern(/[@$!%*?&]/, "special character") // Must contain at least one special character
      .messages({
        "string.min": "password must be at least 8 characters long",
        "string.max": "password must not exceed 32 characters",
        "string.pattern.name": "password must contain at least one {#name}",
        "any.required": "password is required",
      }),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required().messages({
      "any.only": "Confirm password does not match password",
    }),
    sendEmail: Joi.boolean().required(),
  }),
};

const addRolePermission = {
  body: Joi.object().keys({
    role: Joi.string().required(),
    privilege: Joi.array().items(Joi.string().required()).required(),
  }),
};

module.exports = {
  register,
  login,
  forgotPassword,
  verifyOtp,
  changePassword,
  updateUserById,
  resetPassword,
  addRolePermission,
};
