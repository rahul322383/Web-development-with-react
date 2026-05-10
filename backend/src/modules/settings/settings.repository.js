'use strict';

const { Setting } = require('../../database/initModels');

const findAll = (filters = {}) =>
    Setting.findAll({
        where: filters,
    });

const findOne = (filters = {}) =>
    Setting.findOne({
        where: filters,
    });

const upsert = (payload, transaction = null) =>
    Setting.upsert(payload, { transaction });

const bulkUpsert = async (payloads, transaction = null) => {
    return Promise.all(
        payloads.map((payload) =>
            Setting.upsert(payload, { transaction })
        )
    );
};

const remove = (filters = {}, transaction = null) =>
    Setting.destroy({
        where: filters,
        transaction,
    });

module.exports = {
    findAll,
    findOne,
    upsert,
    bulkUpsert,
    remove,
};