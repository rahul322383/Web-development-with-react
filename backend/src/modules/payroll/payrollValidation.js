const Joi = require('joi');

const enqueuePayrollSchema = Joi.object({
  month: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().min(2000).required()
});

const lockPayrollSchema = Joi.object({
  payrollId: Joi.number().integer().positive().required()
});

module.exports = {
  enqueuePayrollSchema,
  lockPayrollSchema
};