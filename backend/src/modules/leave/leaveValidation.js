'use strict';

const Joi = require('joi');

const applyLeaveSchema = Joi.object({
  employeeId: Joi.number().integer().positive().required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
  reason: Joi.string().trim().min(5).max(500).required(),
});

const managerDecisionSchema = Joi.object({
  managerId: Joi.number().integer().positive().required(),
  requestId: Joi.number().integer().positive().required(),
  status: Joi.string().valid('Approved', 'Rejected').required(),
  decisionNote: Joi.string().trim().max(500).optional().allow(''),
});

const validate = (schema, data) => {
  const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
  if (error) {
    return { valid: false, message: error.details.map(d => d.message).join(', ') };
  }
  return { valid: true, value };
};

module.exports = { applyLeaveSchema, managerDecisionSchema, validate };