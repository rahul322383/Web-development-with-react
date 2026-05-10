'use strict';

const repository = require('./settings.repository');
const defaults = require('./settings.defaults');
const { ALLOWED_SETTINGS } = require('./settings.constants');
const { sequelize } = require('../../database/initModels');

const validateSetting = (category, key) =>
    !!(ALLOWED_SETTINGS[category] && ALLOWED_SETTINGS[category].includes(key));

const parseValue = (value, datatype) => {
    switch (datatype) {
        case 'number': return Number(value);
        case 'boolean': return value === 'false' ? false : Boolean(value);
        case 'json': return typeof value === 'string' ? JSON.parse(value) : value;
        default: return String(value);
    }
};

const getSettings = async (scopeType, scopeId) =>
    repository.findAll({ scopeType, scopeId });

const getSetting = async (scopeType, scopeId, category, key) => {
    const setting = await repository.findOne({ scopeType, scopeId, category, key });
    if (setting) return setting;
    return { value: defaults?.[category]?.[key] ?? null };
};

const updateSetting = async (payload) => {
    const { scopeType, scopeId, category, key, value, datatype } = payload;

    if (!validateSetting(category, key)) {
        return { success: false, message: `Invalid setting: "${category}.${key}" is not allowed` };
    }

    const parsedValue = parseValue(value, datatype);
    await repository.upsert({ scopeType, scopeId, category, key, value: parsedValue, datatype });
    return repository.findOne({ scopeType, scopeId, category, key });
};

const updateManySettings = async (settings) => {
    const invalid = settings.filter(({ category, key }) => !validateSetting(category, key));
    if (invalid.length > 0) {
        const keys = invalid.map(({ category, key }) => `${category}.${key}`).join(', ');
        return { success: false, message: `Invalid settings: ${keys}` };
    }

    await sequelize.transaction(async (transaction) => {
        const payloads = settings.map((s) => ({
            ...s,
            value: parseValue(s.value, s.datatype),
        }));
        await repository.bulkUpsert(payloads, transaction);
    });

    return { success: true };
};

const deleteSetting = async (scopeType, scopeId, category, key) => {
    const deleted = await repository.remove({ scopeType, scopeId, category, key });
    if (!deleted) return { success: false, message: 'Setting not found' };
    return { success: true };
};

module.exports = { getSettings, getSetting, updateSetting, updateManySettings, deleteSetting };