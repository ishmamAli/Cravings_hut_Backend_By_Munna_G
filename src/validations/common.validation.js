const Joi = require("joi");
const { objectId } = require("./custom.validation");

const singleObject = {
  params: Joi.object().keys({
    ObjectId: Joi.required().custom(objectId),
  }),
};

const singleQuery = {
  query: Joi.object().keys({
    ObjectId: Joi.required().custom(objectId),
  }),
};
module.exports = {
  singleObject,
  singleQuery,
};
