'use strict';

const Joi = require('joi');

const VALID_SCOPE_TYPES = ['global', 'company', 'department', 'role', 'user'];
const VALID_DATATYPES = ['string', 'number', 'boolean', 'json'];

const VALID_CATEGORIES = [
    'company', 'employee', 'attendance', 'leave', 'payroll',
    'notification', 'security', 'appearance', 'shift', 'geo',
    'document', 'appraisal', 'recruitment', 'expense', 'ai',
    'integration', 'localization', 'analytics', 'workflow', 'system',
];

const updateSchema = Joi.object({
    scopeType: Joi.string().valid(...VALID_SCOPE_TYPES).required(),
    scopeId: Joi.number().integer().positive().allow(null).default(null),
    category: Joi.string().valid(...VALID_CATEGORIES).max(100).required(),
    key: Joi.string().max(100).required(),
    value: Joi.any().required(),
    datatype: Joi.string().valid(...VALID_DATATYPES).required(),
});

const bulkUpdateSchema = Joi.object({
    settings: Joi.array().items(updateSchema).min(1).required(),
});

module.exports = { updateSchema, bulkUpdateSchema };