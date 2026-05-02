// 'use strict';

// const Joi = require('joi');

// const applyLeaveSchema = Joi.object({
//   employeeId: Joi.number().integer().positive().required(),
//   startDate: Joi.date().iso().required(),
//   endDate: Joi.date().iso().min(Joi.ref('startDate')).required(),
//   reason: Joi.string().trim().min(5).max(500).required(),
// });

// // const managerDecisionSchema = Joi.object({
// //   managerId: Joi.number().integer().positive().required(),
// //   requestId: Joi.number().integer().positive().required(),
// //   status: Joi.string().valid('Approved', 'Rejected').required(),
// //   decisionNote: Joi.string().trim().max(500).optional().allow(''),
// // });

// const managerDecisionSchema = Joi.object({
//   status: Joi.string().valid('Approved', 'Rejected').required(),
//   decisionNote: Joi.string().trim().max(500).optional().allow(''),
// });

// module.exports = { applyLeaveSchema, managerDecisionSchema};

'use strict';

// leaveValidation.js
// ─────────────────────────────────────────────────────────────
// BUG FIX: Previously this file had TWO module.exports — one for
// the Joi schemas and one for the Sequelize model. The second one
// silently overwrote the first, so applyLeaveSchema / managerDecisionSchema
// were never actually exported. Sequelize model belongs in its own file.
//
// Additional fixes:
//  - Removed employeeId from applyLeaveSchema (set from req.user.id in controller)
//  - Added leaveType, leaveUnit, publicHolidays fields
//  - managerDecisionSchema keeps status as 'Approved'|'Rejected' (capitalized)
//    to match what service normalises with .toLowerCase()
// ─────────────────────────────────────────────────────────────

const Joi = require('joi');

// ─── Apply for Leave ─────────────────────────────────────────
// employeeId is NOT here — it comes from req.user.id in the controller.
// company_id is NOT here — it comes from req.user.companyId in the controller.
const applyLeaveSchema = Joi.object({
  startDate: Joi.date().iso().required().messages({
    'date.base': 'startDate must be a valid ISO date',
    'any.required': 'startDate is required',
  }),

  endDate: Joi.date().iso().min(Joi.ref('startDate')).required().messages({
    'date.base': 'endDate must be a valid ISO date',
    'date.min': 'endDate must be on or after startDate',
    'any.required': 'endDate is required',
  }),

  reason: Joi.string().trim().min(5).max(500).required().messages({
    'string.min': 'Reason must be at least 5 characters',
    'string.max': 'Reason cannot exceed 500 characters',
    'any.required': 'Reason is required',
  }),

  leaveType: Joi.string()
    .valid('SICK', 'CASUAL', 'PAID', 'UNPAID')
    .default('CASUAL')
    .messages({
      'any.only': 'leaveType must be one of: SICK, CASUAL, PAID, UNPAID',
    }),

  leaveUnit: Joi.string()
    .valid('FULL_DAY', 'HALF_DAY')
    .default('FULL_DAY')
    .messages({
      'any.only': 'leaveUnit must be FULL_DAY or HALF_DAY',
    }),

  // Optional array of 'YYYY-MM-DD' strings to exclude from working-day count
  publicHolidays: Joi.array()
    .items(Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/))
    .default([])
    .optional(),
});

// ─── Manager / Admin Decision ────────────────────────────────
// managerId and requestId come from req.user.id and req.params.id — not the body.
const managerDecisionSchema = Joi.object({
  status: Joi.string()
    .valid('Approved', 'Rejected')   // capital first letter — service normalises via toLowerCase()
    .required()
    .messages({
      'any.only': 'status must be either "Approved" or "Rejected"',
      'any.required': 'status is required',
    }),

  decisionNote: Joi.string().trim().max(500).optional().allow('').messages({
    'string.max': 'Decision note cannot exceed 500 characters',
  }),
});

module.exports = { applyLeaveSchema, managerDecisionSchema };