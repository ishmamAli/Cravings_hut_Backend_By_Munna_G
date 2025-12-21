const Joi = require("joi");
const { objectId } = require("./custom.validation");

const createPermission = {
  body: Joi.object().keys({
    role: Joi.string()
      .required()
      .valid("superAdmin", "subSuperAdmin", "buildingAdmin", "subBuildingAdmin", "installer"),
    privilege: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          value: Joi.boolean().required(),
        })
      )
      .required(),
  }),
};

const updatePermissionById = {
  params: Joi.object().keys({
    permissionId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      role: Joi.string()
        .optional()
        .valid("superAdmin", "subSuperAdmin", "buildingAdmin", "subBuildingAdmin", "installer"),
      privilege: Joi.array()
        .items(
          Joi.object({
            name: Joi.string().required(),
            value: Joi.boolean().required(),
          })
        )
        .optional(),
    })
    .or("name", "privilege"),
};

const getPermissionById = {
  params: Joi.object().keys({
    permissionId: Joi.required().custom(objectId),
  }),
};
const deletePermissionById = {
  params: Joi.object().keys({
    permissionId: Joi.required().custom(objectId),
  }),
};

const getPermssionByRoleName = {
  query: Joi.object().keys({
    role: Joi.string()
      .required()
      .valid("superAdmin", "subSuperAdmin", "buildingAdmin", "subBuildingAdmin", "installer"),
  }),
};

module.exports = {
  createPermission,
  updatePermissionById,
  deletePermissionById,
  getPermissionById,
  getPermssionByRoleName,
};
