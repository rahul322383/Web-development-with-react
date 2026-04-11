// const sequelize = require('../../database/sequelize');
// const { uploadBuffer } = require('../../config/cloudinary');
// const expenseRepository = require('./expenseRepository');
// const { logAuditEvent } = require('../../utils/auditLogger');
// const { clearCacheKeys } = require('../../utils/cache');

// const submitExpense = async ({ employeeId, payload, receiptBuffer, ipAddress }) => {
//   try {
//     return await sequelize.transaction(async (transaction) => {
//       const expense = await expenseRepository.createExpense(
//         {
//           employeeId,
//           category: payload.category,
//           amount: payload.amount,
//           currency: payload.currency,
//           description: payload.description
//         },
//         transaction
//       );
//       console.log('Expense created with ID:', expense.id);
//       console.log('Receipt buffer exists:', !!receiptBuffer);
//       console.log('Receipt buffer size:', receiptBuffer ? receiptBuffer.length : 'N/A');

//       if (receiptBuffer) {
//         const uploadResult = await uploadBuffer(receiptBuffer, 'hrms/expenses');
//         await expenseRepository.createReceipt(
//           {
//             expenseId: expense.id,
//             cloudinaryPublicId: uploadResult.public_id,
//             cloudinaryUrl: uploadResult.secure_url
//           },
//           transaction
//         );
//       }

//       await logAuditEvent({
//         userId: employeeId,
//         moduleName: 'Expense',
//         actionType: 'CREATE',
//         oldData: null,
//         newData: expense,
//         ipAddress
//       });

//       await clearCacheKeys([`dashboard_summary:${employeeId}:${new Date().getFullYear()}`]);

//       const fullExpense = await expenseRepository.findExpenseById(expense.id);
//       return { success: true, message: 'Expense submitted successfully', data: fullExpense };
//     });
//   } catch (err) {
//     return { success: false, message: err.message || 'Failed to submit expense', data: null };
//   }
// };

// const managerReviewExpense = async ({ managerId, expenseId, status, ipAddress }) => {
//   try {
//     return await sequelize.transaction(async (transaction) => {
//       const expense = await expenseRepository.findExpenseById(expenseId);
//       if (!expense) return { success: false, message: 'Expense not found', data: null };
//       if (expense.employee.managerId !== managerId) return { success: false, message: 'Not authorized for this expense', data: null };
//       if (expense.managerApprovalStatus !== 'Pending') return { success: false, message: 'Manager decision already submitted', data: null };

//       await expenseRepository.updateExpense(expenseId, { managerApprovalStatus: status }, transaction);

//       await logAuditEvent({
//         userId: managerId,
//         moduleName: 'Expense',
//         actionType: 'APPROVE',
//         oldData: { managerApprovalStatus: 'Pending' },
//         newData: { managerApprovalStatus: status },
//         ipAddress
//       });

//       await clearCacheKeys([`dashboard_summary:${expense.employeeId}:${new Date().getFullYear()}`]);

//       const updatedExpense = await expenseRepository.findExpenseById(expenseId);
//       return { success: true, message: 'Expense reviewed by manager', data: updatedExpense };
//     });
//   } catch (err) {
//     return { success: false, message: err.message || 'Failed to review expense', data: null };
//   }
// };

// const financeReviewExpense = async ({ financeUserId, expenseId, status, paymentStatus, ipAddress }) => {
//   try {
//     return await sequelize.transaction(async (transaction) => {
//       const expense = await expenseRepository.findExpenseById(expenseId);
//       if (!expense) return { success: false, message: 'Expense not found', data: null };
//       if (expense.managerApprovalStatus !== 'Approved') return { success: false, message: 'Expense must be manager approved first', data: null };
//       if (expense.financeApprovalStatus !== 'Pending') return { success: false, message: 'Finance decision already submitted', data: null };

//       const payload = {
//         financeApprovalStatus: status,
//         paymentStatus: paymentStatus || (status === 'Approved' ? 'Processing' : 'Unpaid')
//       };
//       if (payload.paymentStatus === 'Paid') payload.paidAt = new Date();

//       await expenseRepository.updateExpense(expenseId, payload, transaction);

//       await logAuditEvent({
//         userId: financeUserId,
//         moduleName: 'Expense',
//         actionType: 'APPROVE',
//         oldData: { financeApprovalStatus: 'Pending' },
//         newData: payload,
//         ipAddress
//       });

//       await clearCacheKeys([`dashboard_summary:${expense.employeeId}:${new Date().getFullYear()}`]);

//       const updatedExpense = await expenseRepository.findExpenseById(expenseId);
//       return { success: true, message: 'Expense reviewed by finance', data: updatedExpense };
//     });
//   } catch (err) {
//     return { success: false, message: err.message || 'Failed to review expense', data: null };
//   }
// };

// const listMyExpenses = async (employeeId) => {
//   try {
//     const expenses = await expenseRepository.listExpensesForEmployee(employeeId);
//     return { success: true, message: 'Expenses fetched', data: expenses };
//   } catch (err) {
//     return { success: false, message: err.message || 'Failed to fetch expenses', data: null };
//   }
// };

// const listPendingManager = async (managerId) => {
//   try {
//     const expenses = await expenseRepository.listPendingManagerExpenses(managerId);
//     return { success: true, message: 'Pending manager expenses fetched', data: expenses };
//   } catch (err) {
//     return { success: false, message: err.message || 'Failed to fetch pending expenses', data: null };
//   }
// };

// const listPendingFinance = async () => {
//   try {
//     const expenses = await expenseRepository.listPendingFinanceExpenses();
//     return { success: true, message: 'Pending finance expenses fetched', data: expenses };
//   } catch (err) {
//     return { success: false, message: err.message || 'Failed to fetch pending finance expenses', data: null };
//   }
// };

// module.exports = {
//   submitExpense,
//   managerReviewExpense,
//   financeReviewExpense,
//   listMyExpenses,
//   listPendingManager,
//   listPendingFinance
// };

const sequelize = require('../../database/sequelize');
const { uploadBuffer } = require('../../config/cloudinary');
const expenseRepository = require('./expenseRepository');
const { logAuditEvent } = require('../../utils/auditLogger');
const { clearCacheKeys } = require('../../utils/cache');


const bustDashboardCache = (employeeId) =>
  clearCacheKeys([`dashboard_summary:${employeeId}:${new Date().getFullYear()}`]);

const submitExpense = async ({ employeeId, payload, receiptBuffer, ipAddress }) => {
  
 
  const { category, amount, currency, description } = payload ?? {};
  

  if (!employeeId) return { success: false, message: 'Employee ID is required', data: null };


 if (!category || amount == null || !currency){
    return { success: false, message: 'category, amount, and currency are required', data: null };
  }


  if (typeof amount !== 'number' || amount <= 0) {
    return { success: false, message: 'amount must be a positive number', data: null };
  }

  try {
let uploadResult;

if (receiptBuffer?.length) {
  uploadResult = await uploadBuffer(receiptBuffer, 'hrms/expenses');
}

    return await sequelize.transaction(async (transaction) => {
      const expense = await expenseRepository.createExpense(
        { employeeId, category, amount, currency, description },
        transaction
      );

      if (uploadResult) {
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

      await bustDashboardCache(employeeId);

      const fullExpense = await expenseRepository.findExpenseById(expense.id);
     return { success: true, message: 'Expense submitted successfully', data: fullExpense };
    });
  } catch (err) {
    return { success: false, message: err.message || 'Failed to submit expense', data: null };
  }
};


const managerReviewExpense = async ({ managerId, expenseId, status, ipAddress }) => {
  if (!managerId || !expenseId) {
    return { success: false, message: 'managerId and expenseId are required', data: null };
  }
  if (!['Approved', 'Rejected'].includes(status)) {
    return { success: false, message: "status must be 'Approved' or 'Rejected'", data: null };
  }

  try {
    // Pre-flight read outside the transaction — we only need a lock once we
    // know the update is valid, keeping the critical section short.
    const expense = await expenseRepository.findExpenseById(expenseId);
    if (!expense) return { success: false, message: 'Expense not found', data: null };
    if (expense.employee?.managerId !== managerId) {
      return { success: false, message: 'Not authorized for this expense', data: null };
    }
    if (expense.managerApprovalStatus !== 'Pending') {
      return { success: false, message: 'Manager decision already submitted', data: null };
    }

    return await sequelize.transaction(async (transaction) => {
      await expenseRepository.updateExpense(expenseId, { managerApprovalStatus: status }, transaction);

      await logAuditEvent({
        userId: managerId,
        moduleName: 'Expense',
        actionType: 'APPROVE',
        oldData: { managerApprovalStatus: 'Pending' },
        newData: { managerApprovalStatus: status },
        ipAddress
      });

      await bustDashboardCache(expense.employeeId);

      const updatedExpense = await expenseRepository.findExpenseById(expenseId);
      return { success: true, message: 'Expense reviewed by manager', data: updatedExpense };
    });
  } catch (err) {
    return { success: false, message: err.message || 'Failed to review expense', data: null };
  }
};


const financeReviewExpense = async ({ financeUserId, expenseId, status, paymentStatus, ipAddress }) => {
  if (!financeUserId || !expenseId) {
    return { success: false, message: 'financeUserId and expenseId are required', data: null };
  }
  if (!['Approved', 'Rejected'].includes(status)) {
    return { success: false, message: "status must be 'Approved' or 'Rejected'", data: null };
  }
  const validPaymentStatuses = ['Processing', 'Paid', 'Unpaid'];
  if (paymentStatus && !validPaymentStatuses.includes(paymentStatus)) {
    return { success: false, message: `paymentStatus must be one of: ${validPaymentStatuses.join(', ')}`, data: null };
  }

  try {
    const expense = await expenseRepository.findExpenseById(expenseId);
    if (!expense) return { success: false, message: 'Expense not found', data: null };
    if (expense.managerApprovalStatus !== 'Approved') {
      return { success: false, message: 'Expense must be manager-approved first', data: null };
    }
    if (expense.financeApprovalStatus !== 'Pending') {
      return { success: false, message: 'Finance decision already submitted', data: null };
    }

    // Rejected expenses are never paid — ignore any caller-supplied payment status.
    const resolvedPaymentStatus =
      status === 'Rejected'
        ? 'Unpaid'
        : (paymentStatus ?? 'Processing');

    const updatePayload = {
      financeApprovalStatus: status,
      paymentStatus: resolvedPaymentStatus,
      ...(resolvedPaymentStatus === 'Paid' ? { paidAt: new Date() } : {})
    };

    return await sequelize.transaction(async (transaction) => {
      await expenseRepository.updateExpense(expenseId, updatePayload, transaction);

      await logAuditEvent({
        userId: financeUserId,
        moduleName: 'Expense',
        actionType: 'APPROVE',
        oldData: { financeApprovalStatus: 'Pending' },
        newData: updatePayload,
        ipAddress
      });

      await bustDashboardCache(expense.employeeId);

      const updatedExpense = await expenseRepository.findExpenseById(expenseId);
      return { success: true, message: 'Expense reviewed by finance', data: updatedExpense };
    });
  } catch (err) {
    return { success: false, message: err.message || 'Failed to review expense', data: null };
  }
};


const listMyExpenses = async (employeeId) => {
  if (!employeeId) return { success: false, message: 'employeeId is required', data: null };
  try {
    const expenses = await expenseRepository.listExpensesForEmployee(employeeId);
    return { success: true, message: 'Expenses fetched', data: expenses };
  } catch (err) {
    return { success: false, message: err.message || 'Failed to fetch expenses', data: null };
  }
};


const listPendingManager = async (managerId) => {
  if (!managerId) return { success: false, message: 'managerId is required', data: null };
  try {
    const expenses = await expenseRepository.listPendingManagerExpenses(managerId);
    return { success: true, message: 'Pending manager expenses fetched', data: expenses };
  } catch (err) {
    return { success: false, message: err.message || 'Failed to fetch pending expenses', data: null };
  }
};

/**
 * Returns all expenses that have passed manager approval and are awaiting
 * finance review.
 */
const listPendingFinance = async () => {
  try {
    const expenses = await expenseRepository.listPendingFinanceExpenses();
    return { success: true, message: 'Pending finance expenses fetched', data: expenses };
  } catch (err) {
    return { success: false, message: err.message || 'Failed to fetch pending finance expenses', data: null };
  }
};

module.exports = {
  submitExpense,
  managerReviewExpense,
  financeReviewExpense,
  listMyExpenses,
  listPendingManager,
  listPendingFinance
};