const Joi = require('joi');

const yearSchema = Joi.object({
  year: Joi.number().integer().min(2000).required()
});

module.exports = {
  yearSchema
};