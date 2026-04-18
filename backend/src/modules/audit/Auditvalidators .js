'use strict';

const Joi = require('joi');

const paginationSchema = Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(20),
    page: Joi.number().integer().min(1).default(1),
});

const dateRangeSchema = Joi.object({
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
});

const auditListSchema = paginationSchema.concat(dateRangeSchema).keys({
    moduleName: Joi.string().trim().optional(),
    actionType: Joi.string().trim().optional(),
    userId: Joi.number().integer().positive().optional(),
    search: Joi.string().trim().max(200).optional(),
});

const auditByUserSchema = paginationSchema.concat(dateRangeSchema).keys({
    moduleName: Joi.string().trim().optional(),
    actionType: Joi.string().trim().optional(),
});

const auditByModuleSchema = paginationSchema.concat(dateRangeSchema).keys({
    actionType: Joi.string().trim().optional(),
});

const auditExportSchema = dateRangeSchema.keys({
    moduleName: Joi.string().trim().optional(),
    actionType: Joi.string().trim().optional(),
    userId: Joi.number().integer().positive().optional(),
});

const auditStatsSchema = dateRangeSchema;

const deleteLogsSchema = Joi.object({
    daysToKeep: Joi.number().integer().min(1).required(),
});

const validate = (schema, data) => {
    const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
    if (error) {
        const message = error.details.map(d => d.message).join(', ');
        const err = new Error(message);
        err.statusCode = 400;
        err.name = 'ValidationError';
        throw err;
    }
    return value;
};

module.exports = {
    auditListSchema,
    auditByUserSchema,
    auditByModuleSchema,
    auditExportSchema,
    auditStatsSchema,
    deleteLogsSchema,
    validate,
};