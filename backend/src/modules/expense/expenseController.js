

'use strict';

const asyncHandler = require('../../utils/asyncHandler');
const expenseService = require('./expenseService');

// ---------------------------------------------------------------------------
// submitExpense
// ---------------------------------------------------------------------------

const submitExpense = asyncHandler(async (req, res) => {
  const result = await expenseService.submitExpense({
    employeeId: req.user.id,
    payload: req.body,
    receiptBuffer: req.file?.buffer,
    ipAddress: req.ip,
    actor: req.user          // FIX: pass actor for permission check
  });

  // NOTE: notifications are already handled inside expenseService.submitExpense
  // Do not duplicate them here — recipients would receive two notifications

  return res.status(result.success ? 201 : (result.statusCode || 400)).json(result);
});

// ---------------------------------------------------------------------------
// managerReviewExpense
// ---------------------------------------------------------------------------

const managerReviewExpense = asyncHandler(async (req, res) => {
  const result = await expenseService.managerReviewExpense({
    managerId: req.user.id,
    expenseId: Number(req.params.id),
    status: req.body.status,
    comment: req.body.comment,
    ipAddress: req.ip,
    actor: req.user          // FIX: pass actor for permission check
  });

  // NOTE: employee and finance notifications are handled inside the service
  // via sendNotification + eventBus — no need to duplicate here

  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

// ---------------------------------------------------------------------------
// financeReviewExpense
// ---------------------------------------------------------------------------

const financeReviewExpense = asyncHandler(async (req, res) => {
  const { status, paymentStatus, comment } = req.body;

  const VALID_STATUS = ['APPROVED', 'REJECTED'];
  const VALID_PAYMENT = ['Unpaid', 'Processing', 'Paid'];

  if (!VALID_STATUS.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status', data: null });
  }

  if (paymentStatus && !VALID_PAYMENT.includes(paymentStatus)) {
    return res.status(400).json({ success: false, message: 'Invalid payment status', data: null });
  }

  const result = await expenseService.financeReviewExpense({
    financeUserId: req.user.id,
    expenseId: Number(req.params.id),
    status,
    paymentStatus,
    comment,
    ipAddress: req.ip,
    actor: req.user          // FIX: pass actor for permission check
  });

  // NOTE: employee + manager notifications are handled inside the service
  // Role-based broadcast also belongs in the service/eventBus, not here

  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

// ---------------------------------------------------------------------------
// List functions
// ---------------------------------------------------------------------------

const listMyExpenses = asyncHandler(async (req, res) => {
  const result = await expenseService.listMyExpenses(
    req.user.id,
    req.user       // FIX: pass actor for permission check
  );
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

const listPendingManager = asyncHandler(async (req, res) => {
  console.log('controller req.user:', req.user)
  const result = await expenseService.listPendingManager(
    req.user.id,
    req.user
  );
  console.log(result)
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

const listPendingFinance = asyncHandler(async (req, res) => {
  const result = await expenseService.listPendingFinance(
    req.user
  );
  return res.status(result.success ? 200 : (result.statusCode || 400)).json(result);
});

// ---------------------------------------------------------------------------

module.exports = {
  submitExpense,
  managerReviewExpense,
  financeReviewExpense,
  listMyExpenses,
  listPendingManager,
  listPendingFinance
};