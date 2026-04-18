'use strict';

const Joi = require('joi');

const ALLOWED_CURRENCIES = ['INR', 'USD', 'EUR'];

const submitExpenseSchema = Joi.object({
  category: Joi.string().trim().max(100).required(),
  amount: Joi.number().positive().required(),
  currency: Joi.string().valid(...ALLOWED_CURRENCIES).required(),
  description: Joi.string().trim().max(1000).optional().allow(''),
  idempotencyKey: Joi.string().trim().max(200).optional(),
});

const managerReviewSchema = Joi.object({
  managerId: Joi.number().integer().positive().required(),
  expenseId: Joi.number().integer().positive().required(),
  status: Joi.string().valid('APPROVED', 'REJECTED').required(),
  comment: Joi.string().trim().max(500).optional().allow(''),
});

const financeReviewSchema = Joi.object({
  financeUserId: Joi.number().integer().positive().required(),
  expenseId: Joi.number().integer().positive().required(),
  status: Joi.string().valid('APPROVED', 'REJECTED').required(),
  paymentStatus: Joi.string().valid('Processing', 'Paid').optional(),
});

const validate = (schema, data) => {
  const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
  if (error) {
    return {
      valid: false,
      message: error.details.map(d => d.message).join(', '),
    };
  }
  return { valid: true, value };
};

module.exports = {
  submitExpenseSchema,
  managerReviewSchema,
  financeReviewSchema,
  validate,
  ALLOWED_CURRENCIES,
};