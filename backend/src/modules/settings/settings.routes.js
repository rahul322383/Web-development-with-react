'use strict';

const express = require('express');
const router = express.Router();

const controller = require('./settings.controller');

const authenticate =
    require('../../middleware/auth.middleware');

// -----------------------------------------------------------------------------
// Middleware
// -----------------------------------------------------------------------------

router.use(authenticate);

// -----------------------------------------------------------------------------
// GET ALL SETTINGS
// GET /settings
// -----------------------------------------------------------------------------

router.get(
    '/',
    controller.getAll
);

// -----------------------------------------------------------------------------
// GET SINGLE SETTING
// GET /settings/:category/:settingKey
// -----------------------------------------------------------------------------

router.get(
    '/:category/:settingKey',
    controller.getOne
);

// -----------------------------------------------------------------------------
// UPDATE SINGLE SETTING
// PUT /settings
// -----------------------------------------------------------------------------

router.put(
    '/',
    controller.updateOne
);

// -----------------------------------------------------------------------------
// UPDATE MULTIPLE SETTINGS
// PUT /settings/bulk/update
// -----------------------------------------------------------------------------

router.put(
    '/bulk/update',
    controller.updateMany
);

// -----------------------------------------------------------------------------
// DELETE SINGLE SETTING
// DELETE /settings/:category/:settingKey
// -----------------------------------------------------------------------------

router.delete(
    '/:category/:settingKey',
    controller.remove
);

module.exports = router;