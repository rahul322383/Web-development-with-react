'use strict';

const Joi = require('joi');

const processPayrollSchema = Joi.object({
  month: Joi.number().integer().min(1).max(12).required(),
  year: Joi.number().integer().min(2000).max(2100).required(),
  actorId: Joi.number().integer().positive().optional(),
});


const enqueuePayrollSchema = processPayrollSchema;

const lockPayrollSchema = Joi.object({
  payrollId: Joi.number().integer().positive().required(),
  actorId: Joi.number().integer().positive().optional(),  
});

const employeeIdSchema = Joi.object({
  employeeId: Joi.number().integer().positive().required(),
});


module.exports = {
  processPayrollSchema,
  enqueuePayrollSchema,
  lockPayrollSchema,
  employeeIdSchema,

};