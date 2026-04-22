'use strict';

const asyncHandler = require('../../utils/asyncHandler');
const settingsService = require('./settings.service');

// GET /settings
const getAll = asyncHandler(async (req, res) => {
    const result = await settingsService.getSettings(req.user.id);
    return res.status(result.success ? 200 : (result.statusCode || 500)).json(result);
});

// GET /settings/:key
const getOne = asyncHandler(async (req, res) => {
    const result = await settingsService.getSetting(req.user.id, req.params.key);
    return res.status(result.success ? 200 : (result.statusCode || 500)).json(result);
});

// PUT /settings/:key       body: { value }
const updateOne = asyncHandler(async (req, res) => {
    const result = await settingsService.updateSetting(req.user.id, req.params.key, req.body.value);
    return res.status(result.success ? 200 : (result.statusCode || 500)).json(result);
});

// PUT /settings            body: { settings: [ { key, value } ] }
const updateMany = asyncHandler(async (req, res) => {
    const result = await settingsService.updateManySettings(req.user.id, req.body.settings);
    return res.status(result.success ? 200 : (result.statusCode || 500)).json(result);
});

// DELETE /settings/:key
const remove = asyncHandler(async (req, res) => {
    const result = await settingsService.deleteSetting(req.user.id, req.params.key);
    return res.status(result.success ? 200 : (result.statusCode || 500)).json(result);
});

module.exports = { getAll, getOne, updateOne, updateMany, remove };