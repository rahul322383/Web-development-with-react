const Joi = require('joi');

const createUserSchema = Joi.object({
  employeeCode: Joi.string().max(30).required(),
  firstName: Joi.string().max(80).required(),
  lastName: Joi.string().max(80).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  managerId: Joi.number().integer().positive().allow(null).optional(),
  department: Joi.string().allow('').optional(),
  baseSalary: Joi.number().min(0).default(0),
  role: Joi.string().valid('Employee', 'Manager', 'HR', 'Finance', 'Admin').default('Employee')
});
 
const updateUserSchema = Joi.object({
  firstName: Joi.string().max(80).optional(),
  lastName: Joi.string().max(80).optional(),
  managerId: Joi.number().integer().positive().allow(null).optional(),
  department: Joi.string().allow('').optional(),
  baseSalary: Joi.number().min(0).optional(),
  isActive: Joi.boolean().optional(),
  role: Joi.string().valid('Employee', 'Manager', 'HR', 'Finance', 'Admin').optional()
});

module.exports = {
  createUserSchema,
  updateUserSchema
};