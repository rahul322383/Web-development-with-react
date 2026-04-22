'use strict';

const { Setting } = require('../../database/initModels');

// Get all settings for a user
const findAllByUser = (userId) =>
    Setting.findAll({ where: { userId } });

// Get single setting by key for a user
const findByUserAndKey = (userId, key) =>
    Setting.findOne({ where: { userId, key } });

// Upsert single setting
const upsertSetting = (userId, key, value, transaction = null) =>
    Setting.upsert({ userId, key, value }, { transaction });

// Upsert multiple settings  [ { key, value }, ... ]
const upsertMany = async (userId, settings, transaction = null) => {
    return Promise.all(
        settings.map(({ key, value }) =>
            Setting.upsert({ userId, key, value }, { transaction })
        )
    );
};

// Delete a single setting by key
const deleteByUserAndKey = (userId, key, transaction = null) =>
    Setting.destroy({ where: { userId, key }, transaction });

module.exports = {
    findAllByUser,
    findByUserAndKey,
    upsertSetting,
    upsertMany,
    deleteByUserAndKey,
};