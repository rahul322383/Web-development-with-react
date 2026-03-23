const Joi = require('joi');

const registerSchema = Joi.object({
  employeeCode: Joi.string().max(30).required(),
  firstName: Joi.string().max(80).required(),
  lastName: Joi.string().max(80).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(64).required(),
  department: Joi.string().max(100).allow('').optional(),
  managerId: Joi.number().integer().positive().allow(null).optional(),
  baseSalary: Joi.number().min(0).default(0),
  role: Joi.string().valid('Employee', 'Manager', 'HR', 'Finance', 'Admin').default('Employee')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required()
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema
};