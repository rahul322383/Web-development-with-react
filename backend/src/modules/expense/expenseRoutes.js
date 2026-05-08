'use strict';

const express = require('express');
const multer = require('multer');

const authenticate = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');

const {
  requirePermission,
} = require('../../utils/permissions');

const {
  apiLimiter,
  writeLimiter,
  strictLimiter,
} = require('../../middleware/rateLimit.middleware');

const expenseController = require('./expenseController');

const {
  submitExpenseSchema,
  managerReviewSchema,
  financeReviewSchema,
} = require('./expenseValidation');

const upload = multer({
  storage: multer.memoryStorage(),
});

const router = express.Router();

router.use(authenticate, apiLimiter);

router.post(
  '/',
  writeLimiter,
  requirePermission('SUBMIT_EXPENSE'),
  upload.single('receipt'),
  validate(submitExpenseSchema),
  expenseController.submitExpense
);

router.get(
  '/my',
  strictLimiter,
  requirePermission('LIST_MY_EXPENSES'),
  expenseController.listMyExpenses
);

router.get(
  '/pending-manager',
  strictLimiter,
  requirePermission('LIST_PENDING_MANAGER'),
  expenseController.listPendingManager
);

router.get(
  '/pending-finance',
  strictLimiter,
  requirePermission('LIST_PENDING_FINANCE'),
  expenseController.listPendingFinance
);

router.patch(
  '/:id/manager-review',
  writeLimiter,
  requirePermission('REVIEW_EXPENSE'),
  validate(managerReviewSchema),
  expenseController.managerReviewExpense
);

router.patch(
  '/:id/finance-review',
  writeLimiter,
  requirePermission('FINANCE_REVIEW'),
  validate(financeReviewSchema),
  expenseController.financeReviewExpense
);

module.exports = router;