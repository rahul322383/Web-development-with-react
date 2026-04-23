'use strict';

const Joi = require('joi');

const yearSchema = Joi.object({
  year: Joi.number()
    .integer()
    .min(2000)
    .max(2100)
    .required()
    .messages({
      'number.base': 'year must be a number',
      'number.min': 'year must be 2000 or later',
      'number.max': 'year must be 2100 or earlier',
      'any.required': 'year is required',
    }),
});

const validate = (schema, data) => {
  const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
  if (error) {
    return { valid: false, message: error.details.map((d) => d.message).join(', ') };
  }
  return { valid: true, value };
};

module.exports = { yearSchema, validate };