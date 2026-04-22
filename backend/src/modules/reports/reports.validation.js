'use strict';

const Joi = require('joi');

const dateRangeSchema = Joi.object({
    from: Joi.date().iso().optional(),
    to: Joi.date().iso().min(Joi.ref('from')).optional(),
}).with('from', 'to'); // if from is given, to is required too

const exportParamSchema = Joi.object({
    module: Joi.string().valid('employees', 'payroll', 'leave', 'expenses').required(),
});

module.exports = { dateRangeSchema, exportParamSchema };