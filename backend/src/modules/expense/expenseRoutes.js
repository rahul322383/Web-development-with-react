const express = require('express');
const multer = require('multer');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/rbacMiddleware');
const validate = require('../../middleware/validate.middleware');
const expenseController = require('./expenseController');

const {
  submitExpenseSchema,
  managerDecisionSchema,
  financeDecisionSchema
} = require('./expenseValidation');

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();
router.use(authenticate);

router.post(
  '/',
  authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
  upload.single('receipt'),
  validate(submitExpenseSchema),
  expenseController.submitExpense
);
router.get('/my', authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'), expenseController.listMyExpenses);
router.get('/pending-manager', authorize('Manager','Admin','HR'), expenseController.listPendingManager);
router.get('/pending-finance', authorize('Finance','Admin','HR'), expenseController.listPendingFinance);
router.patch('/:id/manager-review', authorize('Manager','Admin','HR'), validate(managerDecisionSchema), expenseController.managerReviewExpense);
router.patch('/:id/finance-review', authorize('Finance', 'Admin', 'Manager'), validate(financeDecisionSchema), expenseController.financeReviewExpense);

module.exports = router;