
'use strict';

const Joi = require('joi');

const listUsersSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(20),
  page: Joi.number().integer().min(1).default(1),
  search: Joi.string().trim().max(200).optional().allow(''),
});

const createUserSchema = Joi.object({
  employeeCode: Joi.string().trim().max(50).required(),
  firstName: Joi.string().trim().max(100).required(),
  lastName: Joi.string().trim().max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  role: Joi.string().valid('Admin', 'HR', 'Manager', 'Finance', 'Employee').required(),
  managerId: Joi.number().integer().positive().optional(),
  department: Joi.string().trim().max(100).optional(),
  baseSalary: Joi.number().min(0).default(0).optional(),
});

const updateUserSchema = Joi.object({
  employeeCode: Joi.string().trim().max(50).optional(),
  firstName: Joi.string().trim().max(100).optional(),
  lastName: Joi.string().trim().max(100).optional(),
  email: Joi.string().email().optional(),
  role: Joi.string().valid('Admin', 'HR', 'Manager', 'Finance', 'Employee').optional(),
  managerId: Joi.number().integer().positive().optional().allow(null),
  department: Joi.string().trim().max(100).optional(),
  baseSalary: Joi.number().min(0).optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

const dashboardQuerySchema = Joi.object({
  year: Joi.number().integer().min(2000).max(2100).default(new Date().getFullYear()),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

const departmentSchema = Joi.object({
  department: Joi.string().trim().max(100).required(),
});

const validate = (schema, data) => {
  const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
  if (error) {
    return { valid: false, message: error.details.map(d => d.message).join(', ') };
  }
  return { valid: true, value };
};

module.exports = {
  listUsersSchema,
  createUserSchema,
  updateUserSchema,
  dashboardQuerySchema,
  departmentSchema,
  validate,
};