const Joi = require("joi");
const { objectId } = require("./custom.validation");

const setCashOpening = {
  body: Joi.object().keys({
    businessDate: Joi.date().required(),
    amount: Joi.number().required(),
  }),
};

const createBankDeposit = {
  body: Joi.object().keys({
    businessDate: Joi.date().required(),
    amount: Joi.number().required(),
    bankName: Joi.string().optional(),
    referenceNo: Joi.string().optional(),
    notes: Joi.string().optional(),
  }),
};

module.exports = {
  setCashOpening,
  createBankDeposit,
};
