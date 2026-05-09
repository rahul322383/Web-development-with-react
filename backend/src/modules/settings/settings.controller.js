'use strict';

const asyncHandler = require('../../utils/asyncHandler');
const service = require('./settings.service');

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

const getScopeData = (req) => {
    return {
        scopeType:
            req.query.scopeType ||
            req.body.scopeType ||
            'company',

        scopeId:
            req.query.scopeId ||
            req.body.scopeId ||
            req.user?.companyId ||
            req.user?.id ||
            1,
    };
};

// -----------------------------------------------------------------------------
// GET ALL SETTINGS
// GET /settings
// -----------------------------------------------------------------------------

const getAll = asyncHandler(async (req, res) => {

    const { scopeType, scopeId } =
        getScopeData(req);

    const settings =
        await service.getSettings(
            scopeType,
            scopeId
        );

    return res.status(200).json({
        success: true,
        data: settings,
    });
});

// -----------------------------------------------------------------------------
// GET SINGLE SETTING
// GET /settings/:category/:settingKey
// -----------------------------------------------------------------------------

const getOne = asyncHandler(async (req, res) => {

    const { scopeType, scopeId } =
        getScopeData(req);

    const setting =
        await service.getSetting(
            scopeType,
            scopeId,
            req.params.category,
            req.params.settingKey
        );

    return res.status(200).json({
        success: true,
        data: setting,
    });
});

// -----------------------------------------------------------------------------
// UPDATE SINGLE SETTING
// PUT /settings
// -----------------------------------------------------------------------------

const updateOne = asyncHandler(async (req, res) => {

    const { scopeType, scopeId } =
        getScopeData(req);

    const payload = {
        ...req.body,
        scopeType,
        scopeId,
    };

    const result =
        await service.updateSetting(payload);

    return res.status(200).json({
        success: true,
        message: 'Setting updated',
        data: result,
    });
});

// -----------------------------------------------------------------------------
// UPDATE MULTIPLE SETTINGS
// PUT /settings/bulk/update
// -----------------------------------------------------------------------------

const updateMany = asyncHandler(async (req, res) => {

    const { scopeType, scopeId } =
        getScopeData(req);

    if (
        !Array.isArray(req.body.settings)
    ) {
        return res.status(400).json({
            success: false,
            message:
                'settings array is required',
        });
    }

    const settings =
        req.body.settings.map((item) => ({
            ...item,
            scopeType:
                item.scopeType || scopeType,
            scopeId:
                item.scopeId || scopeId,
        }));

    await service.updateManySettings(
        settings
    );

    return res.status(200).json({
        success: true,
        message: 'Settings updated',
    });
});

// -----------------------------------------------------------------------------
// DELETE SETTING
// DELETE /settings/:category/:settingKey
// -----------------------------------------------------------------------------

const remove = asyncHandler(async (req, res) => {

    const { scopeType, scopeId } =
        getScopeData(req);

    await service.deleteSetting(
        scopeType,
        scopeId,
        req.params.category,
        req.params.settingKey
    );

    return res.status(200).json({
        success: true,
        message: 'Setting deleted',
    });
});

module.exports = {
    getAll,
    getOne,
    updateOne,
    updateMany,
    remove,
};