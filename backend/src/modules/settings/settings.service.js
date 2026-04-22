'use strict';

const settingsRepository = require('./settings.repository');
const { sequelize } = require('../../database/initModels');
const logger = require('../../config/logger');

// GET all settings for authenticated user
const getSettings = async (userId) => {
    try {
        const settings = await settingsRepository.findAllByUser(userId);
        return { success: true, data: settings };
    } catch (error) {
        logger.error({ event: 'GET_SETTINGS_FAILED', userId, error: error.message });
        return { success: false, message: error.message || 'Failed to fetch settings', statusCode: 500 };
    }
};

// GET single setting by key
const getSetting = async (userId, key) => {
    try {
        const setting = await settingsRepository.findByUserAndKey(userId, key);
        if (!setting) return { success: false, message: 'Setting not found', statusCode: 404 };
        return { success: true, data: setting };
    } catch (error) {
        logger.error({ event: 'GET_SETTING_FAILED', userId, key, error: error.message });
        return { success: false, message: error.message || 'Failed to fetch setting', statusCode: 500 };
    }
};

// UPDATE single setting  { key, value }
const updateSetting = async (userId, key, value) => {
    try {
        await sequelize.transaction(async (transaction) => {
            await settingsRepository.upsertSetting(userId, key, value, transaction);
        });
        const updated = await settingsRepository.findByUserAndKey(userId, key);
        return { success: true, message: 'Setting updated', data: updated };
    } catch (error) {
        logger.error({ event: 'UPDATE_SETTING_FAILED', userId, key, error: error.message });
        return { success: false, message: error.message || 'Failed to update setting', statusCode: 500 };
    }
};

// UPDATE multiple settings  [ { key, value }, ... ]
const updateManySettings = async (userId, settings) => {
    try {
        if (!Array.isArray(settings) || settings.length === 0)
            return { success: false, message: 'Settings array is required', statusCode: 400 };

        await sequelize.transaction(async (transaction) => {
            await settingsRepository.upsertMany(userId, settings, transaction);
        });

        const updated = await settingsRepository.findAllByUser(userId);
        return { success: true, message: 'Settings updated', data: updated };
    } catch (error) {
        logger.error({ event: 'UPDATE_MANY_SETTINGS_FAILED', userId, error: error.message });
        return { success: false, message: error.message || 'Failed to update settings', statusCode: 500 };
    }
};

// DELETE single setting by key
const deleteSetting = async (userId, key) => {
    try {
        const existing = await settingsRepository.findByUserAndKey(userId, key);
        if (!existing) return { success: false, message: 'Setting not found', statusCode: 404 };

        await settingsRepository.deleteByUserAndKey(userId, key);
        return { success: true, message: 'Setting deleted' };
    } catch (error) {
        logger.error({ event: 'DELETE_SETTING_FAILED', userId, key, error: error.message });
        return { success: false, message: error.message || 'Failed to delete setting', statusCode: 500 };
    }
};

module.exports = {
    getSettings,
    getSetting,
    updateSetting,
    updateManySettings,
    deleteSetting,
};