'use strict';

const Joi = require('joi');

const createCompanySchema = Joi.object({
  name: Joi.string().min(2).max(150).required(),
  email: Joi.string().email().optional(),
  phone: Joi.string().max(20).optional(),
  website: Joi.string().uri().optional(),
  industry: Joi.string().max(100).optional(),
  size: Joi.string().valid('1-10', '11-50', '51-200', '201-500', '500+').optional(),
  addressLine1: Joi.string().max(200).optional(),
  addressLine2: Joi.string().max(200).optional(),
  city: Joi.string().max(100).optional(),
  state: Joi.string().max(100).optional(),
  country: Joi.string().max(100).optional(),
  postalCode: Joi.string().max(20).optional(),
  timezone: Joi.string().max(60).optional(),
  currency: Joi.string().max(10).optional(),
  workingHoursPerDay: Joi.number().min(1).max(24).optional(),
  workingDaysPerWeek: Joi.number().integer().min(1).max(7).optional(),
  annualLeaveQuota: Joi.number().integer().min(0).max(365).optional(),
  fiscalYearStart: Joi.number().integer().min(1).max(12).optional(),
  subscriptionPlan: Joi.string().valid('free', 'starter', 'pro', 'enterprise').optional(),
});

const updateCompanySchema = Joi.object({
  name: Joi.string().min(2).max(150).optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().max(20).optional(),
  website: Joi.string().uri().allow('', null).optional(),
  industry: Joi.string().max(100).optional(),
  size: Joi.string().valid('1-10', '11-50', '51-200', '201-500', '500+').optional(),
  addressLine1: Joi.string().max(200).optional(),
  addressLine2: Joi.string().max(200).allow('', null).optional(),
  city: Joi.string().max(100).optional(),
  state: Joi.string().max(100).optional(),
  country: Joi.string().max(100).optional(),
  postalCode: Joi.string().max(20).optional(),
}).min(1);

const updateSettingsSchema = Joi.object({
  workingHoursPerDay: Joi.number().min(1).max(24).optional(),
  workingDaysPerWeek: Joi.number().integer().min(1).max(7).optional(),
  annualLeaveQuota: Joi.number().integer().min(0).max(365).optional(),
  timezone: Joi.string().max(60).optional(),
  currency: Joi.string().max(10).optional(),
  fiscalYearStart: Joi.number().integer().min(1).max(12).optional(),
  subscriptionPlan: Joi.string().valid('free', 'starter', 'pro', 'enterprise').optional(),
  subscriptionExpiresAt: Joi.date().iso().optional(),
}).min(1);

module.exports = {
  createCompanySchema,
  updateCompanySchema,
  updateSettingsSchema,
};