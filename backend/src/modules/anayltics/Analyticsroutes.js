'use strict';

const express = require('express');
const router = express.Router();

const authenticate = require('../../middleware/auth.middleware');
const { heavyLimiter } = require('../../middleware/rateLimit.middleware');

const {
    getDashboard,
    getAttrition,
    getDepartments,
    getLeaves,
    getCost,
} = require('./analyticsController');

router.use(authenticate);
router.use(heavyLimiter);

router.get('/dashboard', getDashboard);
router.get('/attrition', getAttrition);
router.get('/departments', getDepartments);
router.get('/leaves', getLeaves);
router.get('/cost', getCost);

module.exports = router;