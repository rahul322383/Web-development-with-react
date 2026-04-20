'use strict';

const Joi = require('joi');

const processPayrollSchema = Joi.object({
  month: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().min(2000).max(2100).required(),
  actorId: Joi.number().integer().positive().optional(),
});

// FIX: enqueuePayrollSchema was referenced in routes but never defined —
// it's the same shape as processPayrollSchema so alias it
const enqueuePayrollSchema = processPayrollSchema;

const lockPayrollSchema = Joi.object({
  payrollId: Joi.number().integer().positive().required(),
  actorId: Joi.number().integer().positive().optional(),  // FIX: controller now sets this from req.user.id, not req.body
});

const employeeIdSchema = Joi.object({
  employeeId: Joi.number().integer().positive().required(),
});

const validate = (schema, data) => {
  const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
  if (error) {
    return { valid: false, message: error.details.map((d) => d.message).join(', ') };
  }
  return { valid: true, value };
};

module.exports = {
  processPayrollSchema,
  enqueuePayrollSchema,
  lockPayrollSchema,
  employeeIdSchema,
  validate,
};