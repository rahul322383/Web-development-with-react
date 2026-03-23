const Joi = require('joi');

const submitExpenseSchema = Joi.object({
  category: Joi.string().max(100).required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().max(5).default('USD'),
  description: Joi.string().max(300).allow('').optional()
});

const managerDecisionSchema = Joi.object({
  status: Joi.string().valid('Approved', 'Rejected').required()
});

const financeDecisionSchema = Joi.object({
  status: Joi.string().valid('Approved', 'Rejected').required(),
  paymentStatus: Joi.string().valid('Unpaid', 'Processing', 'Paid').optional()
});

module.exports = {
  submitExpenseSchema,
  managerDecisionSchema,
  financeDecisionSchema
};