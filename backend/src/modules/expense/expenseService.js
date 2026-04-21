

// const sequelize = require('../../database/sequelize');
// const { uploadBuffer } = require('../../config/cloudinary');
// const expenseRepository = require('./expenseRepository');
// const { logAuditEvent } = require('../../utils/auditLogger');
// const { clearCacheKeys } = require('../../utils/cache');
// const { User, Role} = require('../../models');
// const { sendNotification } = require('../../config/socket');
// const { Notification } = require('../../models');
// const { createNotification } =require ('../notification/notificationService');
// const notificationRepository = require('../notification/notificationRepository');



// const bustDashboardCache = (employeeId) =>
//   clearCacheKeys([`dashboard_summary:${employeeId}:${new Date().getFullYear()}`]);


// const STATUS = {
//   PENDING: 'Pending',
//   APPROVED: 'Approved',
//   REJECTED: 'Rejected'
// };

// const PAYMENT_STATUS = {
//   UNPAID: 'Unpaid',
//   PROCESSING: 'Processing',
//   PAID: 'Paid'
// };



// const submitExpense = async ({ employeeId, payload, receiptBuffer, ipAddress }) => {
//   const { category, amount, currency, description } = payload ?? {};

//   if (!employeeId) {
//     return { success: false, message: 'Employee ID is required', data: null };
//   }

//   if (!category || amount == null || !currency) {
//     return { success: false, message: 'category, amount, and currency are required', data: null };
//   }

//   const parsedAmount = Number(amount);

//   if (isNaN(parsedAmount) || parsedAmount <= 0) {
//     return { success: false, message: 'amount must be a positive number', data: null };
//   }

//   const allowedCurrencies = ['INR', 'USD', 'EUR'];

//   if (!allowedCurrencies.includes(currency)) {
//     return { success: false, message: 'Invalid currency', data: null };
//   }

//   try {
//     const user = await User.findByPk(employeeId);

//     if (!user) {
//       return { success: false, message: 'User not found', data: null };
//     }

//     const getUserFullName = (u) =>
//       `${u.first_name || u.firstName || ''} ${u.last_name || u.lastName || ''}`.trim();

//     let uploadResult = null;

//     if (receiptBuffer?.length) {
//       uploadResult = await uploadBuffer(receiptBuffer, 'hrms/expenses');
//     }

//     const result = await sequelize.transaction(async (transaction) => {
//       const expense = await expenseRepository.createExpense(
//         {
//           employeeId,
//           // managerId: user.managerId || null,
//           approvedByManagerId: user.managerId || null,
//           category,
//           amount: parsedAmount,
//           currency,
//           description,
//           status: 'PENDING_REVIEW'
//         },
//         transaction
//       );

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

//       const recipients = new Set();

//       if (user.managerId) {
//         recipients.add(Number(user.managerId));
//       }

//       const roleUsers = await User.findAll({
//         where: {
//           role: ['HR', 'Finance', 'Admin']
//         },
//         attributes: ['id']
//       });

//       roleUsers.forEach((u) => recipients.add(Number(u.id)));

//       recipients.delete(Number(employeeId));

//       const fullName = getUserFullName(user);

//       await Promise.all(
//         [...recipients].map((id) =>
//           notificationRepository.createNotification(
//             {
//               userId: id,
//               title: 'New Expense Request',
//               message: `${fullName} submitted a ${category} expense of ${currency} ${parsedAmount}`,
//               isRead: false,
//               metadata: {
//                 expenseId: expense.id,
//                 type: 'EXPENSE_SUBMISSION'
//               }
//             },
//             transaction
//           )
//         )
//       );

//       await logAuditEvent({
//         userId: employeeId,
//         moduleName: 'Expense',
//         actionType: 'CREATE',
//         oldData: null,
//         newData: expense,
//         ipAddress
//       });

//       await bustDashboardCache(employeeId);

//       const fullExpense = await expenseRepository.findExpenseById(expense.id);

//       return {
//         success: true,
//         message: 'Expense submitted successfully',
//         data: fullExpense || expense
//       };
//     });

//     return result;
//   } catch (err) {
//     return {
//       success: false,
//       message: err.message || 'Failed to submit expense',
//       data: null
//     };
//   }
// };



// const managerReviewExpense = async ({
//   managerId,
//   expenseId,
//   status,
//   comment
// }) => {
//   if (!managerId || !expenseId) {
//     return { success: false, message: 'Missing required fields', data: null };
//   }

//   const normalizedStatus = status?.trim().toUpperCase();

//   if (!normalizedStatus || !['APPROVED', 'REJECTED'].includes(normalizedStatus)) {
//     return { success: false, message: 'Invalid status', data: null };
//   }

//   const finalStatus =
//     normalizedStatus === 'APPROVED'
//       ? STATUS.APPROVED
//       : STATUS.REJECTED;

//   const expense = await expenseRepository.findExpenseById(expenseId);


//   if (!expense) {
//     return { success: false, message: 'Expense not found', data: null };
//   }

//   if (expense.employeeId === managerId) {
//     return {
//       success: false,
//       message: 'You cannot approve your own expense',
//       data: null
//     };
//   }

//   if (expense.managerApprovalStatus !== STATUS.PENDING) {
//     return {
//       success: false,
//       message: 'Already reviewed',
//       data: null
//     };
//   }

//   return sequelize.transaction(async (transaction) => {
//     await expenseRepository.updateExpense(
//       expenseId,
//       {
//         managerApprovalStatus: finalStatus,
//         managerComment: comment || null,
//         approvedByManagerId: managerId
//       },
//       transaction
//     );
   

//     const updatedExpense = await expenseRepository.findExpenseById(expenseId);
   

//     if (!updatedExpense) {
//       return {
//         success: false,
//         message: 'Failed to fetch updated expense',
//         data: null
//       };
//     }

//     const safeStatusText = finalStatus?.toLowerCase() || 'updated';
    
//     await sendNotification(updatedExpense.employeeId, {
//       type: `EXPENSE_${normalizedStatus}`,
//       title: `Expense ${finalStatus} by Manager`,
//       message: `Your expense #${updatedExpense.id} has been ${safeStatusText}.`,
//       expenseId: updatedExpense.id,
//       status: finalStatus,
//       comment: comment || null
//     });
    

//     return {
//       success: true,
//       message: `Expense ${safeStatusText} successfully. Notification sent to employee.`,
//       data: updatedExpense
//     };
//   });
// };


// const financeReviewExpense = async ({
//   financeUserId,
//   expenseId,
//   status,
//   paymentStatus,
//   ipAddress
// }) => {
//   const VALID_STATUS = ['APPROVED', 'REJECTED'];

//   if (!VALID_STATUS.includes(status)) {
//     return { success: false, message: 'Invalid status' };
//   }

//   const expense = await expenseRepository.findExpenseById(expenseId);

//   if (!expense) {
//     return { success: false, message: 'Expense not found' };
//   }

//   if (expense.managerApprovalStatus !== 'Approved') {
//     return { success: false, message: 'Manager approval required' };
//   }

//   if (expense.financeApprovalStatus !== 'Pending') {
//     return { success: false, message: 'Already reviewed' };
//   }

//   const resolvedPaymentStatus =
//     status === 'REJECTED'
//       ? 'Unpaid'
//       : (paymentStatus || 'Processing');

//   const updatedExpense = await sequelize.transaction(async (transaction) => {
//     await expense.update(
//       {
//         financeApprovalStatus: status,
//         paymentStatus: resolvedPaymentStatus,
//         ...(resolvedPaymentStatus === 'Paid' && {
//           paidAt: new Date()
//         })
//       },
//       { transaction }
//     );

//     return expense;
//   });

//   return {
//     success: true,
//     message: 'Finance review completed',
//     data: {
//       id: updatedExpense.id,
//       employeeId: updatedExpense.employeeId,
//       managerId: updatedExpense.approvedByManagerId || updatedExpense.managerId || null,
//       amount: updatedExpense.amount,
//       financeApproval: status,
//       paymentStatus: resolvedPaymentStatus
//     }
//   };
// };





// const listMyExpenses = async (employeeId) => {
//   if (!employeeId) return { success: false, message: 'employeeId is required', data: null };
//   try {
//     const expenses = await expenseRepository.listExpensesForEmployee(employeeId);
//     return { success: true, message: 'Expenses fetched', data: expenses };
//   } catch (err) {
//     return { success: false, message: err.message || 'Failed to fetch expenses', data: null };
//   }
// };


// const listPendingManager = async (managerId) => {
//   if (!managerId) return { success: false, message: 'managerId is required', data: null };
//   try {
//     const expenses = await expenseRepository.listPendingManagerExpenses(managerId);
//     return { success: true, message: 'Pending manager expenses fetched', data: expenses };
//   } catch (err) {
//     return { success: false, message: err.message || 'Failed to fetch pending expenses', data: null };
//   }
// };

// /**
//  * Returns all expenses that have passed manager approval and are awaiting
//  * finance review.
//  */
// const listPendingFinance = async () => {
//   try {
//     const expenses = await expenseRepository.listPendingFinanceExpenses();
//     return { success: true, message: 'Pending finance expenses fetched', data: expenses };
//   } catch (err) {
//     return { success: false, message: err.message || 'Failed to fetch pending finance expenses', data: null };
//   }
// };

// // Add this method to your existing expenseService
// const getFinanceTeamIds = async () => {
//   try {
//     // Query your database for users with finance role
//     const financeUsers = await prisma.user.findMany({
//       where: {
//         role: 'FINANCE' // or whatever role name you use
//       },
//       select: {
//         id: true
//       }
//     });
    
//     return financeUsers.map(user => user.id);
//   } catch (error) {
//     console.error('Error fetching finance team IDs:', error);
//     return [];
//   }
// };


// module.exports = {
//   getFinanceTeamIds,
//   submitExpense,
//   managerReviewExpense,
//   financeReviewExpense,
//   listMyExpenses,
//   listPendingManager,
//   listPendingFinance
// };

'use strict';

const sequelize = require('../../database/sequelize');
const { uploadBuffer } = require('../../config/cloudinary');
const expenseRepository = require('./expenseRepository');
const { logAuditEvent } = require('../../utils/auditLogger');
const { clearCacheKeys } = require('../../utils/cache');
const { sendNotification } = require('../../config/socket');
const { User, Role } = require('../../models');
const notificationRepository = require('../notification/notificationRepository');
const logger = require('../../config/logger');
const eventBus = require('../../utils/Eventbus');           // FIX: removed trailing space
const { assertPermission } = require('../../utils/permissions');
const {
  submitExpenseSchema,
  managerReviewSchema,
  financeReviewSchema,
  validate,
} = require('./expenseValidation');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

const PAYMENT_STATUS = {
  UNPAID: 'Unpaid',
  PROCESSING: 'Processing',
  PAID: 'Paid',
};

// In-memory cache for privileged user IDs — 5 minute TTL.
// NOTE: This is process-local. In a multi-process or serverless environment
// each worker maintains its own cache. Call bustPrivilegedIdsCache() after
// any role change to keep all workers consistent, or move this to Redis.
const PRIVILEGED_IDS_TTL = 5 * 60 * 1000;

let _privilegedIdsCache = null;
let _privilegedIdsCachedAt = 0;

const getPrivilegedUserIds = async (forceRefresh = false) => {
  const now = Date.now();
  if (!forceRefresh && _privilegedIdsCache && (now - _privilegedIdsCachedAt) < PRIVILEGED_IDS_TTL) {
    return _privilegedIdsCache;
  }

  const users = await User.findAll({
    include: [{
      model: Role,
      as: 'role',          // FIX: singular, matches the association alias
      where: { name: ['HR', 'Finance', 'Admin'] },
      attributes: [],
    }],
    attributes: ['id'],
  });

  _privilegedIdsCache = users.map((u) => Number(u.id));
  _privilegedIdsCachedAt = now;
  return _privilegedIdsCache;
};
const bustPrivilegedIdsCache = () => {
  _privilegedIdsCache = null;
  _privilegedIdsCachedAt = 0;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const bustDashboardCache = (employeeId) =>
  clearCacheKeys([
    `dashboard_summary:${employeeId}:${new Date().getFullYear()}`,
    `team_dashboard:${new Date().getFullYear()}`,
    `admin_dashboard:${new Date().getFullYear()}`,
  ]);

const getUserFullName = (u) =>
  `${u.first_name || u.firstName || ''} ${u.last_name || u.lastName || ''}`.trim();

const fail = (message, statusCode = 400, data = null) => ({
  success: false,
  message,
  statusCode,
  data,
});

// FIX: single consistent permission check helper — the shape assertPermission
// returns (.success vs .allowed) only needs to be reconciled in one place.
// If you update assertPermission's return shape, update only this function.
const checkPermission = (actor, permission) => {
  const perm = assertPermission(actor, permission);
  // Support both { success } and { allowed } return shapes during migration
  const granted = perm.success ?? perm.allowed ?? false;
  if (!granted) {
    return fail(perm.message || 'Forbidden', perm.statusCode || 403);
  }
  return null; // null means permitted
};

// ---------------------------------------------------------------------------
// submitExpense
// ---------------------------------------------------------------------------

const submitExpense = async ({ employeeId, payload, receiptBuffer, ipAddress, actor }) => {
  const denied = checkPermission(actor, 'SUBMIT_EXPENSE');
  if (denied) return denied;

  if (!employeeId) return fail('Employee ID is required');

  const validation = validate(submitExpenseSchema, payload ?? {});
  if (!validation.valid) return fail(validation.message);

  const { category, amount, currency, description, idempotencyKey } = validation.value;

  try {
    const user = await User.findByPk(employeeId);
    if (!user) return fail('User not found', 404);

    if (idempotencyKey) {
      const existing = await expenseRepository.findExpenseByIdempotencyKey(idempotencyKey, employeeId);
      if (existing) {
        return {
          success: true,
          message: 'Expense already submitted (idempotent)',
          statusCode: 200,
          data: existing,
        };
      }
    }

    // Upload BEFORE the transaction — Cloudinary failure never rolls back DB writes
    let uploadResult = null;
    if (receiptBuffer?.length) {
      uploadResult = await uploadBuffer(receiptBuffer, 'hrms/expenses');
    }

    const expense = await sequelize.transaction(async (transaction) => {
      const created = await expenseRepository.createExpense(
        {
          employeeId,
          approvedByManagerId: user.managerId || null,
          category,
          amount,
          currency,
          description: description || null,
          idempotencyKey: idempotencyKey || null,
          status: STATUS.PENDING,
          managerApprovalStatus: STATUS.PENDING,
          financeApprovalStatus: STATUS.PENDING,
          paymentStatus: PAYMENT_STATUS.UNPAID,
        },
        transaction,
      );

      if (uploadResult) {
        await expenseRepository.createReceipt(
          {
            expenseId: created.id,
            cloudinaryPublicId: uploadResult.public_id,
            cloudinaryUrl: uploadResult.secure_url,
          },
          transaction,
        );
      }

      return created;
    });

    // Notifications run OUTSIDE the transaction — a notification failure
    // must never roll back a committed expense
    const recipients = new Set();
    if (user.managerId) recipients.add(Number(user.managerId));

    const privilegedIds = await getPrivilegedUserIds();
    privilegedIds.forEach((id) => recipients.add(id));
    recipients.delete(Number(employeeId));

    const fullName = getUserFullName(user);

    await Promise.all(
      [...recipients].map((id) =>
        notificationRepository.createNotification({
          userId: id,
          title: 'New Expense Request',
          message: `${fullName} submitted a ${category} expense of ${currency} ${amount}`,
          isRead: false,
          metadata: { expenseId: expense.id, type: 'EXPENSE_SUBMISSION' },
        }).catch((err) =>
          logger.error({ event: 'NOTIFY_FAILED', recipientId: id, error: err.message }),
        ),
      ),
    );

    try {
      await logAuditEvent({
        userId: employeeId, moduleName: 'Expense', actionType: 'CREATE',
        oldData: null, newData: expense, ipAddress,
      });
    } catch (auditErr) {
      logger.error({ event: 'AUDIT_LOG_FAILED', error: auditErr.message });
    }

    // Fire-and-forget — cache bust failure is logged but never surfaces to caller
    bustDashboardCache(employeeId).catch((err) =>
      logger.error({ event: 'CACHE_BUST_FAILED', error: err.message }),
    );

    eventBus.emit('EXPENSE_SUBMITTED', { expense, employeeId, fullName });

    const fullExpense = await expenseRepository.findExpenseById(expense.id);
    return {
      success: true,
      message: 'Expense submitted successfully',
      statusCode: 201,
      data: fullExpense || expense,
    };

  } catch (err) {
    logger.error({ event: 'SUBMIT_EXPENSE_FAILED', employeeId, error: err.message, stack: err.stack });
    return fail(err.message || 'Failed to submit expense', 500);
  }
};

// ---------------------------------------------------------------------------
// managerReviewExpense
// ---------------------------------------------------------------------------

const managerReviewExpense = async ({ managerId, expenseId, status, comment, actor }) => {
  const denied = checkPermission(actor, 'REVIEW_EXPENSE');
  if (denied) return denied;

  const validation = validate(managerReviewSchema, { managerId, expenseId, status, comment });
  if (!validation.valid) return fail(validation.message);

  const { value } = validation;
  const finalStatus = value.status === 'APPROVED' ? STATUS.APPROVED : STATUS.REJECTED;

  try {
    const expense = await expenseRepository.findExpenseById(value.expenseId);
    if (!expense) return fail('Expense not found', 404);

    if (Number(expense.employeeId) === Number(value.managerId)) {
      return fail('You cannot approve your own expense', 403);
    }

    if (expense.managerApprovalStatus !== STATUS.PENDING) {
      return fail('Expense has already been reviewed by a manager', 409);
    }

    // Race condition guard: the WHERE condition on managerApprovalStatus = 'Pending'
    // is enforced inside the UPDATE query so two concurrent managers cannot both approve
    const affectedRows = await sequelize.transaction(async (transaction) => {
      return expenseRepository.updateExpenseConditional(
        value.expenseId,
        {
          managerApprovalStatus: finalStatus,
          managerComment: value.comment || null,
          approvedByManagerId: value.managerId,
        },
        { managerApprovalStatus: STATUS.PENDING },
        transaction,
      );
    });

    if (!affectedRows) {
      return fail('Expense was already reviewed by another manager', 409);
    }

    const updatedExpense = await expenseRepository.findExpenseById(value.expenseId);
    if (!updatedExpense) return fail('Failed to fetch updated expense', 500);

    // Fire-and-forget — socket failure must never fail the API response
    sendNotification(updatedExpense.employeeId, {
      type: `EXPENSE_${value.status}`,
      title: `Expense ${finalStatus} by Manager`,
      message: `Your expense #${updatedExpense.id} has been ${finalStatus.toLowerCase()}.`,
      expenseId: updatedExpense.id,
      status: finalStatus,
      comment: value.comment || null,
    });

    eventBus.emit('EXPENSE_MANAGER_REVIEWED', {
      expense: updatedExpense,
      managerId: value.managerId,
      status: finalStatus,
    });

    try {
      await logAuditEvent({
        userId: value.managerId, moduleName: 'Expense', actionType: 'MANAGER_REVIEW',
        oldData: expense, newData: updatedExpense,
      });
    } catch (auditErr) {
      logger.error({ event: 'AUDIT_LOG_FAILED', error: auditErr.message });
    }

    return {
      success: true,
      message: `Expense ${finalStatus.toLowerCase()} successfully`,
      statusCode: 200,
      data: updatedExpense,
    };

  } catch (err) {
    logger.error({ event: 'MANAGER_REVIEW_FAILED', managerId, expenseId, error: err.message, stack: err.stack });
    return fail(err.message || 'Failed to review expense', 500);
  }
};

// ---------------------------------------------------------------------------
// financeReviewExpense
// ---------------------------------------------------------------------------

const financeReviewExpense = async ({ financeUserId, expenseId, status, paymentStatus, ipAddress, actor }) => {
  const denied = checkPermission(actor, 'FINANCE_REVIEW');
  if (denied) return denied;

  const validation = validate(financeReviewSchema, { financeUserId, expenseId, status, paymentStatus });
  if (!validation.valid) return fail(validation.message);

  const { value } = validation;
  const finalStatus = value.status === 'APPROVED' ? STATUS.APPROVED : STATUS.REJECTED;

  try {
    const expense = await expenseRepository.findExpenseById(value.expenseId);
    if (!expense) return fail('Expense not found', 404);

    if (expense.managerApprovalStatus !== STATUS.APPROVED) {
      return fail('Manager approval is required before finance review', 422);
    }

    if (expense.financeApprovalStatus !== STATUS.PENDING) {
      return fail('Expense has already been reviewed by finance', 409);
    }

    const resolvedPaymentStatus =
      finalStatus === STATUS.REJECTED
        ? PAYMENT_STATUS.UNPAID
        : (value.paymentStatus || PAYMENT_STATUS.PROCESSING);

    const affectedRows = await sequelize.transaction(async (transaction) => {
      return expenseRepository.updateExpenseConditional(
        value.expenseId,
        {
          financeApprovalStatus: finalStatus,
          paymentStatus: resolvedPaymentStatus,
          ...(resolvedPaymentStatus === PAYMENT_STATUS.PAID && { paidAt: new Date() }),
        },
        { financeApprovalStatus: STATUS.PENDING },
        transaction,
      );
    });

    if (!affectedRows) {
      return fail('Expense was already reviewed by another finance member', 409);
    }

    const updatedExpense = await expenseRepository.findExpenseById(value.expenseId);

    sendNotification(updatedExpense.employeeId, {
      type: `EXPENSE_FINANCE_${value.status}`,
      title: `Expense ${finalStatus} by Finance`,
      message: `Your expense #${updatedExpense.id} has been ${finalStatus.toLowerCase()} by finance.`,
      expenseId: updatedExpense.id,
      status: finalStatus,
      paymentStatus: resolvedPaymentStatus,
    });

    eventBus.emit('EXPENSE_FINANCE_REVIEWED', {
      expense: updatedExpense,
      financeUserId: value.financeUserId,
      status: finalStatus,
      paymentStatus: resolvedPaymentStatus,
    });

    try {
      await logAuditEvent({
        userId: value.financeUserId, moduleName: 'Expense', actionType: 'FINANCE_REVIEW',
        oldData: expense, newData: updatedExpense, ipAddress,
      });
    } catch (auditErr) {
      logger.error({ event: 'AUDIT_LOG_FAILED', error: auditErr.message });
    }

    bustDashboardCache(updatedExpense.employeeId).catch((err) =>
      logger.error({ event: 'CACHE_BUST_FAILED', error: err.message }),
    );

    return {
      success: true,
      message: 'Finance review completed',
      statusCode: 200,
      data: {
        id: updatedExpense.id,
        employeeId: updatedExpense.employeeId,
        managerId: updatedExpense.approvedByManagerId || null,
        amount: updatedExpense.amount,
        financeApproval: finalStatus,
        paymentStatus: resolvedPaymentStatus,
      },
    };

  } catch (err) {
    logger.error({ event: 'FINANCE_REVIEW_FAILED', financeUserId, expenseId, error: err.message, stack: err.stack });
    return fail(err.message || 'Failed to complete finance review', 500);
  }
};

// ---------------------------------------------------------------------------
// List functions
// ---------------------------------------------------------------------------

const listMyExpenses = async (employeeId, actor) => {
  const denied = checkPermission(actor, 'LIST_MY_EXPENSES');
  if (denied) return denied;

  if (!employeeId) return fail('employeeId is required');

  const actorRoles = [
    actor?.primaryRole,
    actor?.role
  ].filter(Boolean);
  console.log(actorRoles)

  const canAccessAll = ['HR', 'Finance', 'Admin'].some(r =>
    actorRoles.some(a => a.toLowerCase() === r.toLowerCase())
  );

  if (!canAccessAll && Number(actor?.id) !== Number(employeeId)) {
    return fail('You can only view your own expenses', 403);
  }

  try {
    const expenses = await expenseRepository.listExpensesForEmployee(employeeId);
    return { success: true, message: 'Expenses fetched', statusCode: 200, data: expenses };
  } catch (err) {
    logger.error({ event: 'LIST_MY_EXPENSES_FAILED', employeeId, error: err.message });
    return fail(err.message || 'Failed to fetch expenses', 500);
  }
};

const listPendingManager = async (managerId, actor) => {
  const denied = checkPermission(actor, 'LIST_PENDING_MANAGER');
  if (denied) return denied;

  if (!managerId) return fail('managerId is required');

  try {
    const expenses = await expenseRepository.listPendingManagerExpenses(managerId);
    return { success: true, message: 'Pending manager expenses fetched', statusCode: 200, data: expenses };
  } catch (err) {
    logger.error({ event: 'LIST_PENDING_MANAGER_FAILED', managerId, error: err.message });
    return fail(err.message || 'Failed to fetch pending expenses', 500);
  }
};

const listPendingFinance = async (actor) => {
  const denied = checkPermission(actor, 'LIST_PENDING_FINANCE');
  if (denied) return denied;

  try {
    const expenses = await expenseRepository.listPendingFinanceExpenses();
    return { success: true, message: 'Pending finance expenses fetched', statusCode: 200, data: expenses };
  } catch (err) {
    logger.error({ event: 'LIST_PENDING_FINANCE_FAILED', error: err.message });
    return fail(err.message || 'Failed to fetch pending finance expenses', 500);
  }
};

// ---------------------------------------------------------------------------

module.exports = {
  submitExpense,
  managerReviewExpense,
  financeReviewExpense,
  listMyExpenses,
  listPendingManager,
  listPendingFinance,
  bustPrivilegedIdsCache,
};