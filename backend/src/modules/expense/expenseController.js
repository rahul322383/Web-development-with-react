const asyncHandler = require('../../utils/asyncHandler');
const expenseService = require('./expenseService');

const submitExpense = asyncHandler(async (req, res) => {
  const result = await expenseService.submitExpense({
    employeeId: req.user.id,
    payload: req.body,
    receiptBuffer: req.file?.buffer,
    ipAddress: req.ip
  });
  res.status(201).json(result);
});

const managerReviewExpense = asyncHandler(async (req, res) => {
  const result = await expenseService.managerReviewExpense({
    managerId: req.user.id,
    expenseId: Number(req.params.id),
    status: req.body.status,
    ipAddress: req.ip
  });
  res.status(200).json(result);
});

const financeReviewExpense = asyncHandler(async (req, res) => {
  const result = await expenseService.financeReviewExpense({
    financeUserId: req.user.id,
    expenseId: Number(req.params.id),
    status: req.body.status,
    paymentStatus: req.body.paymentStatus,
    ipAddress: req.ip
  });
  res.status(200).json(result);
});

const listMyExpenses = asyncHandler(async (req, res) => {
  const result = await expenseService.listMyExpenses(req.user.id);
  res.status(200).json(result);
});

const listPendingManager = asyncHandler(async (req, res) => {
  const result = await expenseService.listPendingManager(req.user.id);
  res.status(200).json(result);
});

const listPendingFinance = asyncHandler(async (_req, res) => {
  const result = await expenseService.listPendingFinance();
  res.status(200).json(result);
});

module.exports = {
  submitExpense,
  managerReviewExpense,
  financeReviewExpense,
  listMyExpenses,
  listPendingManager,
  listPendingFinance
};