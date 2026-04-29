
// const express = require('express');
// const authenticate = require('../../middleware/auth.middleware');
// const authorize = require('../../middleware/rbacMiddleware');
// const validate = require('../../middleware/validate.middleware');
// const userController = require('./user.controller');
// const { createUserSchema, updateUserSchema } = require('./user.validation');
// const { assignManagerController } = require('./user.controller');

// const router = express.Router();

// router.use(authenticate);

// router.get('/dashboard/summary', authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'), userController.getDashboardSummary);
// router.get('/department/:department', authorize('HR', 'Admin', 'Manager', 'Finance'), userController.getUsersByDepartment);
// router.get('/', authorize('HR', 'Admin', 'Manager', 'Finance'), userController.listUsers);
// router.get('/:id', authorize('HR', 'Admin', 'Manager', 'Finance'), userController.getUserById);
// router.post('/', authorize('HR', 'Admin'), validate(createUserSchema), userController.createUser);
// router.patch('/:id', authorize('HR', 'Admin', 'Manager', 'Finance'), validate(updateUserSchema), userController.updateUser);
// router.delete('/:id', authorize('Admin'), userController.deleteUser);
// router.post('/assign-manager', assignManagerController)

// module.exports = router;

'use strict';

const express = require('express');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/rbacMiddleware');
const validate = require('../../middleware/validate.middleware');
const userController = require('./user.controller');
const { createUserSchema, updateUserSchema } = require('./user.validation');

const router = express.Router();

router.use(authenticate);

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get(
    '/dashboard/summary',
    authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
    userController.getDashboardSummary
);

// ── Department filter ─────────────────────────────────────────────────────────
router.get(
    '/department/:department',
    authorize('HR', 'Admin', 'Manager', 'Finance'),
    userController.getUsersByDepartment
);

// ── Assign manager — MUST be before /:id ─────────────────────────────────────
router.post(
    '/assign-manager',
    authorize('HR', 'Admin'),          // only HR/Admin should reassign managers
    userController.assignManagerController
);

// ── Collection ────────────────────────────────────────────────────────────────
router.get(
    '/',
    authorize('HR', 'Admin', 'Manager', 'Finance'),
    userController.listUsers
);

router.post(
    '/',
    authorize('HR', 'Admin'),
    validate(createUserSchema),
    userController.createUser
);

// ── Single resource — /:id ALWAYS last ───────────────────────────────────────
router.get(
    '/:id',
    authorize('HR', 'Admin', 'Manager', 'Finance'),
    userController.getUserById
);

router.patch(
    '/:id',
    authorize('HR', 'Admin', 'Manager', 'Finance'),
    validate(updateUserSchema),
    userController.updateUser
);

router.delete(
    '/:id',
    authorize('Admin'),
    userController.deleteUser
);

module.exports = router;