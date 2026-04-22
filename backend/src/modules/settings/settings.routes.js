'use strict';

const express = require('express');
const authenticate = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const { apiLimiter } = require('../../middleware/rateLimit.middleware');
const settingsController = require('./settings.controller');
const { updateOneSchema, updateManySchema } = require('./settings.validation');

const router = express.Router();

// All routes require authentication — settings are per-user only
router.use(authenticate, apiLimiter);

router.get('/', settingsController.getAll);
router.get('/:key', settingsController.getOne);
router.put('/', validate(updateManySchema), settingsController.updateMany);  // bulk
router.put('/:key', validate(updateOneSchema), settingsController.updateOne);   // single
router.delete('/:key', settingsController.remove);

module.exports = router;