

const asyncHandler = require('../../utils/asyncHandler');
const expenseService = require('./expenseService');
const { sendNotification } = require('../../config/socket');
const { User, Role } = require('../../models');
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



const VALID_ROLES = ['HR', 'Finance', 'Admin', 'Manager'];
const VALID_STATUS = ['APPROVED', 'REJECTED'];
const VALID_PAYMENT = ['Unpaid', 'Processing', 'Paid'];

const financeReviewExpense = asyncHandler(async (req, res) => {
  const { status, paymentStatus, comment } = req.body;

  if (!VALID_STATUS.includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status'
    });
  }

  if (paymentStatus && !VALID_PAYMENT.includes(paymentStatus)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid payment status'
    });
  }

  const result = await expenseService.financeReviewExpense({
    financeUserId: req.user.id,
    expenseId: Number(req.params.id),
    status,
    paymentStatus,
    ipAddress: req.ip
  });

  if (!result.success || !result.data) {
    return res.status(400).json(result);
  }

  const {
    id,
    employeeId,
    managerId,
    amount,
    financeApproval,
    paymentStatus: finalPaymentStatus
  } = result.data;

  const approvalText = financeApproval.toLowerCase();

  const payload = {
    type: `EXPENSE_FINANCE_${financeApproval}`,
    title: `Expense ${financeApproval === 'APPROVED' ? 'Approved' : 'Rejected'} by Finance`,
    message: `Expense #${id} has been ${approvalText} by finance. Payment status: ${finalPaymentStatus}`,
    expenseId: id,
    amount,
    financeApproval,
    paymentStatus: finalPaymentStatus,
    comment: comment || null
  };

  const sentTo = new Set();

  await sendNotification(employeeId, payload);
  sentTo.add(employeeId);

  if (managerId && !sentTo.has(managerId)) {
    await sendNotification(managerId, payload);
    sentTo.add(managerId);
  }

  const roleUsers = await User.findAll({
    where: { role: VALID_ROLES },
    attributes: ['id']
  });

  await Promise.all(
    roleUsers.map(async (u) => {
      if (!sentTo.has(u.id)) {
        await sendNotification(u.id, payload);
        sentTo.add(u.id);
      }
    })
  );

  return res.status(200).json({
    success: true,
    message: result.message,
    data: result.data
  });
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