'use strict';

const express = require('express');
const authenticate = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const { analyticsLimiter, strictLimiter } = require('../../config/security');
const settingsController = require('./settings.controller');
const { updateOneSchema, updateManySchema } = require('./settings.validation');

const router = express.Router();

router.use(authenticate, analyticsLimiter);

router.get('/', settingsController.getAll);

router.get('/:key', settingsController.getOne);

router.put('/', strictLimiter, validate(updateManySchema), settingsController.updateMany);

router.put('/:key', strictLimiter, validate(updateOneSchema), settingsController.updateOne);

router.delete('/:key', strictLimiter, settingsController.remove);

module.exports = router;