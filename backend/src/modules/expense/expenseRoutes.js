'use strict';

const express = require('express');
const multer = require('multer');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/rbacMiddleware');
const validate = require('../../middleware/validate.middleware');
const { apiLimiter, writeLimiter, strictLimiter } = require('../../middleware/rateLimit.middleware');
const expenseController = require('./expenseController');

const {
  submitExpenseSchema,
  managerReviewSchema,
  financeReviewSchema,
} = require('./expenseValidation');

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.use(authenticate, apiLimiter);

router.post(
  '/',
  writeLimiter,
  authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
  upload.single('receipt'),
  validate(submitExpenseSchema),
  expenseController.submitExpense
);

router.get(
  '/my',
  strictLimiter,
  authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
  expenseController.listMyExpenses
);

router.get(
  '/pending-manager',
  strictLimiter,
  authorize('Manager', 'Admin', 'HR', 'Finance'),
  expenseController.listPendingManager
);

router.get(
  '/pending-finance',
  strictLimiter,
  authorize('Finance', 'Admin', 'HR', 'Manager'),
  expenseController.listPendingFinance
);

router.patch(
  '/:id/manager-review',
  writeLimiter,
  authorize('Manager', 'Admin', 'HR'),
  validate(managerReviewSchema),
  expenseController.managerReviewExpense
);

router.patch(
  '/:id/finance-review',
  writeLimiter,
  authorize('Finance', 'Admin', 'Manager'),
  validate(financeReviewSchema),
  expenseController.financeReviewExpense
);

module.exports = router;