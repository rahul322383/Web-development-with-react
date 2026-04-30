'use strict';

const Joi = require('joi');

const applyLeaveSchema = Joi.object({
  employeeId: Joi.number().integer().positive().required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
  reason: Joi.string().trim().min(5).max(500).required(),
});

// const managerDecisionSchema = Joi.object({
//   managerId: Joi.number().integer().positive().required(),
//   requestId: Joi.number().integer().positive().required(),
//   status: Joi.string().valid('Approved', 'Rejected').required(),
//   decisionNote: Joi.string().trim().max(500).optional().allow(''),
// });

const managerDecisionSchema = Joi.object({
  status: Joi.string().valid('Approved', 'Rejected').required(),
  decisionNote: Joi.string().trim().max(500).optional().allow(''),
});

module.exports = { applyLeaveSchema, managerDecisionSchema};