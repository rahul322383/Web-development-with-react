'use strict';

const Joi = require('joi');

const updateOneSchema = Joi.object({
    value: Joi.alternatives()
        .try(Joi.string(), Joi.number(), Joi.boolean())
        .required(),
});

const updateManySchema = Joi.object({
    settings: Joi.array()
        .items(
            Joi.object({
                key: Joi.string().max(100).required(),
                value: Joi.alternatives()
                    .try(Joi.string(), Joi.number(), Joi.boolean())
                    .required(),
            })
        )
        .min(1)
        .required(),
});

module.exports = { updateOneSchema, updateManySchema };