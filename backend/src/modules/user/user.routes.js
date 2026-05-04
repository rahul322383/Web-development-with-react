'use strict';

const express = require('express');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/rbacMiddleware');
const validate = require('../../middleware/validate.middleware');
const userController = require('./user.controller');
const { createUserSchema, updateUserSchema } = require('./user.validation');

// 🔥 ADD LIMITERS
const { analyticsLimiter, strictLimiter } = require('../../config/security');

const router = express.Router();

/* 🔒 AUTH */
router.use(authenticate);

// ── Dashboard (frequent hits → moderate limit) ───────────────────────────────
router.get(
    '/dashboard/summary',
    analyticsLimiter, // 🔥 prevent spam refresh
    authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
    userController.getDashboardSummary
);

// ── Department filter ─────────────────────────────────────────────────────────
router.get(
    '/department/:department',
    authorize('HR', 'Admin', 'Manager', 'Finance'),
    userController.getUsersByDepartment
);

// ── Assign manager (sensitive) ───────────────────────────────────────────────
router.post(
    '/assign-manager',
    strictLimiter, // 🔥 prevent abuse
    authorize('HR', 'Admin'),
    userController.assignManagerController
);

// ── Collection ───────────────────────────────────────────────────────────────
router.get(
    '/',
    authorize('HR', 'Admin', 'Manager', 'Finance'),
    userController.listUsers
);

router.post(
    '/',
    strictLimiter, // 🔥 user creation is sensitive
    authorize('HR', 'Admin'),
    validate(createUserSchema),
    userController.createUser
);

// ── Single resource ──────────────────────────────────────────────────────────
router.get(
    '/:id',
    authorize('HR', 'Admin', 'Manager', 'Finance'),
    userController.getUserById
);

router.patch(
    '/:id',
    strictLimiter, // 🔥 updates controlled
    authorize('HR', 'Admin', 'Manager', 'Finance'),
    validate(updateUserSchema),
    userController.updateUser
);

router.delete(
    '/:id',
    strictLimiter, // 🔥 destructive action
    authorize('Admin'),
    userController.deleteUser
);

module.exports = router;