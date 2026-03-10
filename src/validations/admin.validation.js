const Joi = require("joi");
const { objectId } = require("./custom.validation");

const register = {
  body: Joi.object().keys({
    full_name: Joi.string().required(),
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
    permission: Joi.string().required().custom(objectId),
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

const categorySchema = {
  body: Joi.object().keys({
    name: Joi.string().required(),
  }),
};

const dealItemSchema = Joi.object({
  item: Joi.string().custom(objectId).optional(), // optional
  category: Joi.string().custom(objectId).optional(), // optional
  quantity: Joi.number().integer().min(1).default(1),
})
  .custom((value, helpers) => {
    // must have at least item or category
    if (!value.item && !value.category) {
      return helpers.error("any.custom");
    }
    return value;
  }, "item-or-category-required")
  .messages({
    "any.custom": "Each deal item must have either an item or category",
  });

const ingredientSchema = Joi.object({
  inventoryItem: Joi.string().required().custom(objectId), // Inventory _id
  quantity: Joi.number().positive().required(), // per 1 menu item
  unit: Joi.string().max(20).optional(), // "g", "ml", "pcs", etc.
});

const createMenuItem = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    type: Joi.string().valid("item", "deal").default("item"),
    price: Joi.number().required(),
    category: Joi.required().custom(objectId),

    dealItems: Joi.when("type", {
      is: "deal",
      then: Joi.array().items(dealItemSchema).min(1).required(),
      otherwise: Joi.forbidden(),
    }),
    ingredients: Joi.array().items(ingredientSchema).optional(),
  }),
};

const updateMenuItemById = {
  body: Joi.object()
    .keys({
      name: Joi.string().optional(),
      price: Joi.number().optional(),
      category: Joi.optional().custom(objectId),
      type: Joi.string().valid("item", "deal").optional(),
      dealItems: Joi.array().items(dealItemSchema).min(1).optional(),
      ingredients: Joi.array().items(ingredientSchema).optional(),
    })
    .or("name", "price", "category", "type", "dealItems", "ingredients"),
};

const tableSchema = {
  body: Joi.object().keys({
    number: Joi.string().required(),
  }),
};

const createInventory = {
  body: Joi.object().keys({
    itemName: Joi.string().required(),
    quantity: Joi.number().required(),
    unit: Joi.string().optional().valid("g", "kg", "ml", "l", "pcs"),
    unitPrice: Joi.number().required(),
    description: Joi.string().required(),
    inventoryType: Joi.string().valid("consumable", "nonconsumable").optional(),
  }),
};

const updateInventoryById = {
  body: Joi.object()
    .keys({
      itemName: Joi.string().optional(),
      quantity: Joi.number().optional(),
      unit: Joi.string().optional().valid("g", "kg", "ml", "l", "pcs"),
      unitPrice: Joi.number().optional(),
      description: Joi.string().optional(),
      inventoryType: Joi.string().valid("consumable", "nonconsumable").optional(),
    })
    .or("itemName", "quantity", "unitPrice", "description", "inventoryType", "unit"),
};

const createExpense = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    amount: Joi.number().required(),
    date: Joi.date().required(),
    supplier: Joi.string().optional().custom(objectId),
    paymentMethod: Joi.string().required().valid("cash", "online"),
  }),
};

const updateExpenseById = {
  body: Joi.object()
    .keys({
      name: Joi.string().optional(),
      amount: Joi.number().optional(),
      date: Joi.date().optional(),
      supplier: Joi.string().optional().custom(objectId),
      paymentMethod: Joi.string().optional().valid("cash", "online"),
    })
    .or("name", "amount", "date", "supplier", "paymentMethod"),
};

const createIncome = {
  body: Joi.object().keys({
    source: Joi.string().required(),
    amount: Joi.number().required(),
    date: Joi.date().required(),
    supplier: Joi.string().optional().custom(objectId).allow("", null),
    buyer: Joi.string().optional().custom(objectId).allow("", null),
    paymentMethod: Joi.string().optional().valid("cash", "online"),
  }),
};

const updateIncomeById = {
  body: Joi.object()
    .keys({
      source: Joi.string().optional(),
      amount: Joi.number().optional(),
      date: Joi.date().optional(),
      supplier: Joi.string().optional().custom(objectId).allow("", null),
      buyer: Joi.string().optional().custom(objectId).allow("", null),
      paymentMethod: Joi.string().optional().valid("cash", "online"),
    })
    .or("source", "amount", "date", "supplier", "paymentMethod"),
};

const createSupplier = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    address: Joi.string().optional(),
    contactNumber: Joi.string().optional(),
    email: Joi.string().email().optional(),
    faxNumber: Joi.string().optional(),
    resourcePerson: Joi.string().optional().allow("").trim().allow(null),
  }),
};

const updateSupplierById = {
  body: Joi.object()
    .keys({
      name: Joi.string().required(),
      address: Joi.string().required(),
      contactNumber: Joi.string().optional(),
      email: Joi.string().email().optional(),
      faxNumber: Joi.string().optional(),
      resourcePerson: Joi.string().optional().allow("").trim().allow(null),
    })
    .or("name", "address", "contactNumber", "email", "faxNumber", "resourcePerson"),
};

const addWastage = {
  body: Joi.object().keys({
    item: Joi.string().required().custom(objectId),
    quantity: Joi.number().required(),
    reason: Joi.string().required(),
    date: Joi.date().required(),
  }),
};

const addPreparationCostForMenu = {
  body: Joi.object().keys({
    menuItemId: Joi.string().required().custom(objectId),
    preparationCost: Joi.number().required(),
  }),
};

const assignKitchenInventory = {
  body: Joi.object().keys({
    item: Joi.string().required().custom(objectId),
    quantity: Joi.number().required(),
    reason: Joi.string().required(),
    date: Joi.date().required(),
  }),
};

const createBuyer = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    idCardNumber: Joi.string().optional(),
    address: Joi.string().optional(),
    contactNumber: Joi.string().optional(),
    email: Joi.string().email().optional(),
    faxNumber: Joi.string().optional(),
    resourcePerson: Joi.string().optional(),
  }),
};

const updateBuyerById = {
  body: Joi.object()
    .keys({
      name: Joi.string().required(),
      idCardNumber: Joi.string().optional().allow("", null),
      address: Joi.string().optional().allow("", null),
      contactNumber: Joi.string().allow("", null),
      email: Joi.string().email().allow("", null),
      faxNumber: Joi.string().allow("", null),
      resourcePerson: Joi.string().allow("", null),
    })
    .or("name", "idCardNumber", "address", "contactNumber", "email", "faxNumber", "resourcePerson"),
};

const createOil = {
  body: Joi.object().keys({
    source: Joi.string().required().trim(),
    amount: Joi.number().required().min(0),
    oldQuantity: Joi.number().optional().min(0),
    quantity: Joi.number().required().min(0),
    changeType: Joi.string().required().valid("new", "replaced", "topped_up"),
    changedAt: Joi.date().required(),
  }),
};

const updateOilById = {
  body: Joi.object()
    .keys({
      source: Joi.string().optional().trim(),
      amount: Joi.number().optional().min(0),
      quantity: Joi.number().optional().min(0),
      oldQuantity: Joi.number().optional().min(0),
      changeType: Joi.string().optional().valid("new", "replaced", "topped_up"),
      changedAt: Joi.date().optional(),
    })
    .or("source", "amount", "quantity", "oldQuantity", "changeType", "changedAt"),
};

const createEmployeeProfile = {
  body: Joi.object().keys({
    user: Joi.string().required().custom(objectId),
    designation: Joi.string().optional().allow("", null),
    department: Joi.string().optional().allow("", null),
    joiningDate: Joi.date().required(),
    basicSalary: Joi.number().required().min(0),
    workingDaysPerMonth: Joi.number().optional(),
    shortLeavePenaltyRatio: Joi.number().optional(),
  }),
};

const markAttendance = {
  body: Joi.object().keys({
    employee: Joi.string().required().custom(objectId),
    date: Joi.date().required(),
    status: Joi.string().required().valid("present", "absent", "short_leave", "leave"),
    checkIn: Joi.date().optional().allow(null),
    checkOut: Joi.date().optional().allow(null),
    notes: Joi.string().optional().allow("", null),
  }),
};

const generateSalary = {
  body: Joi.object().keys({
    employeeId: Joi.string().required().custom(objectId),
    month: Joi.number().required().min(1).max(12),
    year: Joi.number().required(),
  }),
};

module.exports = {
  register,
  login,
  resetPassword,
  categorySchema,
  createMenuItem,
  updateMenuItemById,
  tableSchema,
  createInventory,
  updateInventoryById,
  createExpense,
  updateExpenseById,
  createIncome,
  updateIncomeById,
  createSupplier,
  updateSupplierById,
  addWastage,
  addPreparationCostForMenu,
  assignKitchenInventory,
  createBuyer,
  updateBuyerById,
  createOil,
  updateOilById,
  createEmployeeProfile,
  markAttendance,
  generateSalary,
};
