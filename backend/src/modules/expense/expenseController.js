// const asyncHandler = require('../../utils/asyncHandler');
// const expenseService = require('./expenseService');

// const submitExpense = asyncHandler(async (req, res) => {
//   const result = await expenseService.submitExpense({
//     employeeId: req.user.id,
//     payload: req.body,
//     receiptBuffer: req.file?.buffer,
//     ipAddress: req.ip
//   });

//   return res.status(result.success ? 201 : 400).json(result);
// });

// const managerReviewExpense = asyncHandler(async (req, res) => {
//   const result = await expenseService.managerReviewExpense({
//     managerId: req.user.id,
//     expenseId: Number(req.params.id),
//     status: req.body.status,
//     ipAddress: req.ip
//   });
//   res.status(200).json(result);
// });

// const financeReviewExpense = asyncHandler(async (req, res) => {
//   const result = await expenseService.financeReviewExpense({
//     financeUserId: req.user.id,
//     expenseId: Number(req.params.id),
//     status: req.body.status,
//     paymentStatus: req.body.paymentStatus,
//     ipAddress: req.ip
//   });
//   res.status(200).json(result);
// });

// const listMyExpenses = asyncHandler(async (req, res) => {
//   const result = await expenseService.listMyExpenses(req.user.id);
//   res.status(200).json(result);
// });

// const listPendingManager = asyncHandler(async (req, res) => {
//   const result = await expenseService.listPendingManager(req.user.id);
//   res.status(200).json(result);
// });

// const listPendingFinance = asyncHandler(async (_req, res) => {
//   const result = await expenseService.listPendingFinance();
//   res.status(200).json(result);
// });

// module.exports = {
//   submitExpense,
//   managerReviewExpense,
//   financeReviewExpense,
//   listMyExpenses,
//   listPendingManager,
//   listPendingFinance
// };

const asyncHandler = require('../../utils/asyncHandler');
const expenseService = require('./expenseService');
const { sendNotification } = require('../../config/socket');

const submitExpense = asyncHandler(async (req, res) => {
  const result = await expenseService.submitExpense({
    employeeId: req.user.id,
    payload: req.body,
    receiptBuffer: req.file?.buffer,
    ipAddress: req.ip
  });

  // Send notification to employee
  if (result.success) {
    sendNotification(req.user.id, {
      type: "EXPENSE_SUBMITTED",
      title: "Expense Submitted Successfully",
      message: `Your expense request for $${result.data.amount} has been submitted and is pending approval.`,
      expenseId: result.data.id,
      amount: result.data.amount,
      status: "PENDING_MANAGER"
    });

    // Notify manager (you might need to fetch manager ID from user service)
    if (result.data.managerId) {
      sendNotification(result.data.managerId, {
        type: "EXPENSE_PENDING_REVIEW",
        title: "New Expense Requires Review",
        message: `A new expense request for $${result.data.amount} from ${req.user.name || 'Employee'} requires your review.`,
        expenseId: result.data.id,
        amount: result.data.amount,
        employeeId: req.user.id,
        employeeName: req.user.name
      });
    }
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

  if (result.success) {
    // Notify employee about manager's decision
    sendNotification(result.data.employeeId, {
      type: `EXPENSE_${result.data.managerApproval}`,
      title: `Expense ${result.data.managerApproval === 'APPROVED' ? 'Approved' : 'Rejected'} by Manager`,
      message: `Your expense request #${result.data.id} has been ${result.data.managerApproval.toLowerCase()} by your manager.`,
      expenseId: result.data.id,
      amount: result.data.amount,
      managerApproval: result.data.managerApproval,
      comment: req.body.comment
    });

    // If approved, notify finance team
    if (result.data.managerApproval === 'APPROVED') {
      // You might want to notify all finance team members
      // For now, sending to a specific finance user ID or group
      const financeTeamIds = await expenseService.getFinanceTeamIds();
      financeTeamIds.forEach(financeId => {
        sendNotification(financeId, {
          type: "EXPENSE_PENDING_FINANCE_REVIEW",
          title: "Expense Ready for Finance Review",
          message: `Expense #${result.data.id} for $${result.data.amount} has been approved by manager and requires finance review.`,
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