const Joi = require('joi');

const applyLeaveSchema = Joi.object({
  startDate: Joi.date().required(),
  endDate: Joi.date().required(),
  reason: Joi.string().max(300).allow('').optional()
});

const leaveDecisionSchema = Joi.object({
  status: Joi.string().valid('Approved', 'Rejected').required(),
  decisionNote: Joi.string().max(300).allow('').optional()
});

module.exports = {
  applyLeaveSchema,
  leaveDecisionSchema
};