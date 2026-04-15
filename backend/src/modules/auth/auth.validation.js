const Joi = require("joi");

// 🔐 Register Schema (Hardened)
const registerSchema = Joi.object({
  employeeCode: Joi.string().trim().max(30).required(),

  firstName: Joi.string().trim().min(2).max(80).required(),

  lastName: Joi.string().trim().min(2).max(80).required(),

  email: Joi.string()
    .email()
    .trim()
    .lowercase()
    .required(),

  password: Joi.string()
    .min(8)
    .max(64)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)"))
    .message(
      "Password must contain at least 1 uppercase, 1 lowercase, and 1 number"
    )
    .required(),

  department: Joi.string()
    .trim()
    .max(100)
    .allow("", null)
    .optional(),

  managerId: Joi.number()
    .integer()
    .positive()
    .allow(null)
    .optional(),

  baseSalary: Joi.number()
    .min(0)
    .default(0),

  role: Joi.string()
    .valid("Employee", "Manager", "HR", "Finance", "Admin")
    .default("Employee")
});

// 🔐 Login Schema
const loginSchema = Joi.object({
  email: Joi.string().email().trim().lowercase().required(),
  password: Joi.string().required()
});

// 🔐 Refresh Token Schema
const refreshSchema = Joi.object({
  refreshToken: Joi.string().required()
});

module.exports = {
  registerSchema,
  loginSchema,
  refreshSchema
};