const sequelize = require('../../database/sequelize');
const AppError = require('../../utils/AppError');
const { uploadBuffer } = require('../../config/cloudinary');
const expenseRepository = require('./expenseRepository');
const { logAuditEvent } = require('../../utils/auditLogger');
const { clearCacheKeys } = require('../../utils/cache');

const submitExpense = async ({ employeeId, payload, receiptBuffer, ipAddress }) =>
  sequelize.transaction(async (transaction) => {
    const expense = await expenseRepository.createExpense(
      {
        employeeId,
        category: payload.category,
        amount: payload.amount,
        currency: payload.currency,
        description: payload.description
      },
      transaction
    );

    if (receiptBuffer) {
      const uploadResult = await uploadBuffer(receiptBuffer, 'hrms/expenses');
      await expenseRepository.createReceipt(
        {
          expenseId: expense.id,
          cloudinaryPublicId: uploadResult.public_id,
          cloudinaryUrl: uploadResult.secure_url
        },
        transaction
      );
    }

    await logAuditEvent({
      userId: employeeId,
      moduleName: 'Expense',
      actionType: 'CREATE',
      oldData: null,
      newData: expense,
      ipAddress
    });

    await clearCacheKeys([`dashboard_summary:${employeeId}:${new Date().getFullYear()}`]);

    return expenseRepository.findExpenseById(expense.id);
  });

const managerReviewExpense = async ({ managerId, expenseId, status, ipAddress }) =>
  sequelize.transaction(async (transaction) => {
    const expense = await expenseRepository.findExpenseById(expenseId);
    if (!expense) {
      throw new AppError('Expense not found', 404);
    }

    if (expense.employee.managerId !== managerId) {
      throw new AppError('Not authorized for this expense', 403);
    }

    if (expense.managerApprovalStatus !== 'Pending') {
      throw new AppError('Manager decision already submitted', 400);
    }

    await expenseRepository.updateExpense(expenseId, { managerApprovalStatus: status }, transaction);

    await logAuditEvent({
      userId: managerId,
      moduleName: 'Expense',
      actionType: 'APPROVE',
      oldData: { managerApprovalStatus: 'Pending' },
      newData: { managerApprovalStatus: status },
      ipAddress
    });

    await clearCacheKeys([`dashboard_summary:${expense.employeeId}:${new Date().getFullYear()}`]);

    return expenseRepository.findExpenseById(expenseId);
  });

const financeReviewExpense = async ({ financeUserId, expenseId, status, paymentStatus, ipAddress }) =>
  sequelize.transaction(async (transaction) => {
    const expense = await expenseRepository.findExpenseById(expenseId);
    if (!expense) {
      throw new AppError('Expense not found', 404);
    }

    if (expense.managerApprovalStatus !== 'Approved') {
      throw new AppError('Expense must be manager approved first', 400);
    }

    if (expense.financeApprovalStatus !== 'Pending') {
      throw new AppError('Finance decision already submitted', 400);
    }

    const payload = {
      financeApprovalStatus: status,
      paymentStatus: paymentStatus || (status === 'Approved' ? 'Processing' : 'Unpaid')
    };

    if (payload.paymentStatus === 'Paid') {
      payload.paidAt = new Date();
    }

    await expenseRepository.updateExpense(expenseId, payload, transaction);

    await logAuditEvent({
      userId: financeUserId,
      moduleName: 'Expense',
      actionType: 'APPROVE',
      oldData: { financeApprovalStatus: 'Pending' },
      newData: payload,
      ipAddress
    });

    await clearCacheKeys([`dashboard_summary:${expense.employeeId}:${new Date().getFullYear()}`]);

    return expenseRepository.findExpenseById(expenseId);
  });

const listMyExpenses = async (employeeId) => expenseRepository.listExpensesForEmployee(employeeId);

const listPendingManager = async (managerId) => expenseRepository.listPendingManagerExpenses(managerId);

const listPendingFinance = async () => expenseRepository.listPendingFinanceExpenses();

module.exports = {
  submitExpense,
  managerReviewExpense,
  financeReviewExpense,
  listMyExpenses,
  listPendingManager,
  listPendingFinance
};