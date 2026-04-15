

const asyncHandler = require('../../utils/asyncHandler');
const expenseService = require('./expenseService');
const { sendNotification } = require('../../config/socket');
const { User } = require('../../models/user.model');
const { getUsersByRoles } = require('./expenseRepository');




const submitExpense = asyncHandler(async (req, res) => {
  const result = await expenseService.submitExpense({
    employeeId: req.user.id,
    payload: req.body,
    receiptBuffer: req.file?.buffer,
    ipAddress: req.ip
  });

  if (result.success) {
    const { id, amount } = result.data;
    const employeeName = req.user.name || "Employee";

    // ✅ Employee notification
    sendNotification(req.user.id, {
      type: "EXPENSE_SUBMITTED",
      title: "Expense Submitted",
      message: `₹${amount} expense submitted successfully and is under review.`,
      expenseId: id,
      amount,
      status: "PENDING_APPROVAL"
    });

    // 🔥 Roles that should receive notification
    const rolesToNotify = ["FINANCE_MANAGER", "HR", "ADMIN"];

    const financeUsers = await getUsersByRoles(rolesToNotify);

    financeUsers.forEach(user => {
      sendNotification(user.id, {
        type: "EXPENSE_REVIEW_REQUIRED",
        title: "Expense Approval Needed",
        message: `${employeeName} submitted an expense of ₹${amount}. Review and approve/reject it.`,
        expenseId: id,
        amount,
        employeeId: req.user.id,
        employeeName
      });
    });
  }

  return res.status(result.success ? 201 : 400).json(result);
});

const managerReviewExpense = asyncHandler(async (req, res) => {
  const result = await expenseService.managerReviewExpense({
    managerId: req.user.id,
    expenseId: Number(req.params.id),
    status: req.body.status,
    ipAddress: req.ip
  });

  if (result.success && result.data) {
    const approval = result.data.managerApproval || "PENDING";
    const safeApprovalText = approval.toLowerCase();

    sendNotification(result.data.employeeId, {
      type: `EXPENSE_${approval}`,
      title: `Expense ${approval === 'APPROVED' ? 'Approved' : 'Rejected'} by Manager`,
      message: `Your expense request #${result.data.id} has been ${safeApprovalText} by your manager.`,
      expenseId: result.data.id,
      amount: result.data.amount,
      managerApproval: approval,
      comment: req.body.comment
    });

    if (approval === 'APPROVED') {
      const financeTeamIds = await expenseService.getFinanceTeamIds();

      financeTeamIds.forEach((financeId) => {
        sendNotification(financeId, {
          type: "EXPENSE_PENDING_FINANCE_REVIEW",
          title: "Expense Ready for Finance Review",
          message: `Expense #${result.data.id} for ₹${result.data.amount} has been approved by manager and requires finance review.`,
          expenseId: result.data.id,
          amount: result.data.amount,
          employeeId: result.data.employeeId
        });
      });
    }
  }

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

  if (result.success) {
    // Notify employee about finance decision
    sendNotification(result.data.employeeId, {
      type: `EXPENSE_FINANCE_${result.data.financeApproval}`,
      title: `Expense ${result.data.financeApproval === 'APPROVED' ? 'Approved' : 'Rejected'} by Finance`,
      message: `Your expense request #${result.data.id} has been ${result.data.financeApproval.toLowerCase()} by finance team. Payment status: ${result.data.paymentStatus}`,
      expenseId: result.data.id,
      amount: result.data.amount,
      financeApproval: result.data.financeApproval,
      paymentStatus: result.data.paymentStatus,
      comment: req.body.comment
    });

    // Notify manager about finance decision
    if (result.data.managerId) {
      sendNotification(result.data.managerId, {
        type: `EXPENSE_FINANCE_${result.data.financeApproval}`,
        title: `Finance Team ${result.data.financeApproval === 'APPROVED' ? 'Approved' : 'Rejected'} Expense`,
        message: `Expense #${result.data.id} from employee has been ${result.data.financeApproval.toLowerCase()} by finance team.`,
        expenseId: result.data.id,
        amount: result.data.amount,
        financeApproval: result.data.financeApproval,
        paymentStatus: result.data.paymentStatus
      });
    }
  }

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