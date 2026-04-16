

const sequelize = require('../../database/sequelize');
const { uploadBuffer } = require('../../config/cloudinary');
const expenseRepository = require('./expenseRepository');
const { logAuditEvent } = require('../../utils/auditLogger');
const { clearCacheKeys } = require('../../utils/cache');
const { User, Role} = require('../../models');
const { sendNotification } = require('../../config/socket');
const { Notification } = require('../../models');
const { createNotification } =require ('../notification/notificationService');
const notificationRepository = require('../notification/notificationRepository');



const bustDashboardCache = (employeeId) =>
  clearCacheKeys([`dashboard_summary:${employeeId}:${new Date().getFullYear()}`]);


const STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected'
};

const PAYMENT_STATUS = {
  UNPAID: 'Unpaid',
  PROCESSING: 'Processing',
  PAID: 'Paid'
};


// const submitExpense = async ({ employeeId, payload, receiptBuffer, ipAddress }) => {
//   const { category, amount, currency, description } = payload ?? {};

//   if (!employeeId) {
//     return { success: false, message: 'Employee ID is required', data: null };
//   }

//   if (!category || amount == null || !currency) {
//     return { success: false, message: 'category, amount, and currency are required', data: null };
//   }

//   // ✅ Parse amount safely
//   const parsedAmount = Number(amount);
//   if (isNaN(parsedAmount) || parsedAmount <= 0) {
//     return { success: false, message: 'amount must be a positive number', data: null };
//   }

//   // ✅ Validate currency
//   const allowedCurrencies = ['INR', 'USD', 'EUR'];
//   if (!allowedCurrencies.includes(currency)) {
//     return { success: false, message: 'Invalid currency', data: null };
//   }

//   try {
//     // ✅ Fetch user & manager
//     const user = await User.findByPk(employeeId);
//     if (!user) {
//       return { success: false, message: 'User not found', data: null };
//     }

//     const managerId = user.managerId;

//     let uploadResult;
//     if (receiptBuffer?.length) {
//       uploadResult = await uploadBuffer(receiptBuffer, 'hrms/expenses');
//     }

//     return await sequelize.transaction(async (transaction) => {
      
//       const expense = await expenseRepository.createExpense(
//         {
//           employeeId,
//           managerId,
//           category,
//           amount: parsedAmount,
//           currency,
//           description,
//           status: 'PENDING_MANAGER'
//         },
//         transaction
//       );

//       // ✅ Save receipt
//       if (uploadResult) {
//         await expenseRepository.createReceipt(
//           {
//             expenseId: expense.id,
//             cloudinaryPublicId: uploadResult.public_id,
//             cloudinaryUrl: uploadResult.secure_url
//           },
//           transaction
//         );
//       }

//       // ✅ Audit log
//       await logAuditEvent({
//         userId: employeeId,
//         moduleName: 'Expense',
//         actionType: 'CREATE',
//         oldData: null,
//         newData: expense,
//         ipAddress
//       });

//       // ✅ Cache clear
//       await bustDashboardCache(employeeId);

//       // ✅ Fetch full data
//      const fullExpense = await expenseRepository.findExpenseById(expense.id);

// return {
//   success: true,
//   message: 'Expense submitted successfully',
//   data: fullExpense || expense   
// };
//     });

//   } catch (err) {
//     return {
//       success: false,
//       message: err.message || 'Failed to submit expense',
//       data: null
//     };
//   }
// };



const submitExpense = async ({ employeeId, payload, receiptBuffer, ipAddress }) => {
  const { category, amount, currency, description } = payload ?? {};

  if (!employeeId) {
    return { success: false, message: 'Employee ID is required', data: null };
  }

  if (!category || amount == null || !currency) {
    return { success: false, message: 'category, amount, and currency are required', data: null };
  }

  const parsedAmount = Number(amount);

  if (isNaN(parsedAmount) || parsedAmount <= 0) {
    return { success: false, message: 'amount must be a positive number', data: null };
  }

  const allowedCurrencies = ['INR', 'USD', 'EUR'];

  if (!allowedCurrencies.includes(currency)) {
    return { success: false, message: 'Invalid currency', data: null };
  }

  try {
    const user = await User.findByPk(employeeId);

    if (!user) {
      return { success: false, message: 'User not found', data: null };
    }

    const getUserFullName = (u) =>
      `${u.first_name || u.firstName || ''} ${u.last_name || u.lastName || ''}`.trim();

    let uploadResult = null;

    if (receiptBuffer?.length) {
      uploadResult = await uploadBuffer(receiptBuffer, 'hrms/expenses');
    }

    const result = await sequelize.transaction(async (transaction) => {
      const expense = await expenseRepository.createExpense(
        {
          employeeId,
          // managerId: user.managerId || null,
          approvedByManagerId: user.managerId || null,
          category,
          amount: parsedAmount,
          currency,
          description,
          status: 'PENDING_REVIEW'
        },
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

      const recipients = new Set();

      if (user.managerId) {
        recipients.add(Number(user.managerId));
      }

      const roleUsers = await User.findAll({
        where: {
          role: ['HR', 'Finance', 'Admin']
        },
        attributes: ['id']
      });

      roleUsers.forEach((u) => recipients.add(Number(u.id)));

      recipients.delete(Number(employeeId));

      const fullName = getUserFullName(user);

      await Promise.all(
        [...recipients].map((id) =>
          notificationRepository.createNotification(
            {
              userId: id,
              title: 'New Expense Request',
              message: `${fullName} submitted a ${category} expense of ${currency} ${parsedAmount}`,
              isRead: false,
              metadata: {
                expenseId: expense.id,
                type: 'EXPENSE_SUBMISSION'
              }
            },
            transaction
          )
        )
      );

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

      return {
        success: true,
        message: 'Expense submitted successfully',
        data: fullExpense || expense
      };
    });

    return result;
  } catch (err) {
    return {
      success: false,
      message: err.message || 'Failed to submit expense',
      data: null
    };
  }
};



const managerReviewExpense = async ({
  managerId,
  expenseId,
  status,
  comment
}) => {
  if (!managerId || !expenseId) {
    return { success: false, message: 'Missing required fields', data: null };
  }

  const normalizedStatus = status?.trim().toUpperCase();

  if (!normalizedStatus || !['APPROVED', 'REJECTED'].includes(normalizedStatus)) {
    return { success: false, message: 'Invalid status', data: null };
  }

  const finalStatus =
    normalizedStatus === 'APPROVED'
      ? STATUS.APPROVED
      : STATUS.REJECTED;

  const expense = await expenseRepository.findExpenseById(expenseId);


  if (!expense) {
    return { success: false, message: 'Expense not found', data: null };
  }

  if (expense.employeeId === managerId) {
    return {
      success: false,
      message: 'You cannot approve your own expense',
      data: null
    };
  }

  if (expense.managerApprovalStatus !== STATUS.PENDING) {
    return {
      success: false,
      message: 'Already reviewed',
      data: null
    };
  }

  return sequelize.transaction(async (transaction) => {
    await expenseRepository.updateExpense(
      expenseId,
      {
        managerApprovalStatus: finalStatus,
        managerComment: comment || null,
        approvedByManagerId: managerId
      },
      transaction
    );
   

    const updatedExpense = await expenseRepository.findExpenseById(expenseId);
   

    if (!updatedExpense) {
      return {
        success: false,
        message: 'Failed to fetch updated expense',
        data: null
      };
    }

    const safeStatusText = finalStatus?.toLowerCase() || 'updated';
    
    await sendNotification(updatedExpense.employeeId, {
      type: `EXPENSE_${normalizedStatus}`,
      title: `Expense ${finalStatus} by Manager`,
      message: `Your expense #${updatedExpense.id} has been ${safeStatusText}.`,
      expenseId: updatedExpense.id,
      status: finalStatus,
      comment: comment || null
    });
    

    return {
      success: true,
      message: `Expense ${safeStatusText} successfully. Notification sent to employee.`,
      data: updatedExpense
    };
  });
};


const financeReviewExpense = async ({
  financeUserId,
  expenseId,
  status,
  paymentStatus,
  ipAddress
}) => {
  const VALID_STATUS = ['APPROVED', 'REJECTED'];

  if (!VALID_STATUS.includes(status)) {
    return { success: false, message: 'Invalid status' };
  }

  const expense = await expenseRepository.findExpenseById(expenseId);

  if (!expense) {
    return { success: false, message: 'Expense not found' };
  }

  if (expense.managerApprovalStatus !== 'Approved') {
    return { success: false, message: 'Manager approval required' };
  }

  if (expense.financeApprovalStatus !== 'Pending') {
    return { success: false, message: 'Already reviewed' };
  }

  const resolvedPaymentStatus =
    status === 'REJECTED'
      ? 'Unpaid'
      : (paymentStatus || 'Processing');

  const updatedExpense = await sequelize.transaction(async (transaction) => {
    await expense.update(
      {
        financeApprovalStatus: status,
        paymentStatus: resolvedPaymentStatus,
        ...(resolvedPaymentStatus === 'Paid' && {
          paidAt: new Date()
        })
      },
      { transaction }
    );

    return expense;
  });

  return {
    success: true,
    message: 'Finance review completed',
    data: {
      id: updatedExpense.id,
      employeeId: updatedExpense.employeeId,
      managerId: updatedExpense.approvedByManagerId || updatedExpense.managerId || null,
      amount: updatedExpense.amount,
      financeApproval: status,
      paymentStatus: resolvedPaymentStatus
    }
  };
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

// Add this method to your existing expenseService
const getFinanceTeamIds = async () => {
  try {
    // Query your database for users with finance role
    const financeUsers = await prisma.user.findMany({
      where: {
        role: 'FINANCE' // or whatever role name you use
      },
      select: {
        id: true
      }
    });
    
    return financeUsers.map(user => user.id);
  } catch (error) {
    console.error('Error fetching finance team IDs:', error);
    return [];
  }
};


module.exports = {
  getFinanceTeamIds,
  submitExpense,
  managerReviewExpense,
  financeReviewExpense,
  listMyExpenses,
  listPendingManager,
  listPendingFinance
};