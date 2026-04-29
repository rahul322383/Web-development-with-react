// 'use strict';

// /**
//  * src/modules/notification/notificationListener.js
//  *
//  * Single file that listens to ALL eventBus events and dispatches
//  * notifications through the correct channels via notificationDispatcher.
//  *
//  * Register once at startup in server.js:
//  *   require('./src/modules/notification/notificationListener');
//  */

// const eventBus = require('../../utils/Eventbus');
// const { dispatch, dispatchBulk } = require('./notificationDispatcher');
// const logger = require('../../config/logger');

// // Safety wrapper — a bad listener must never crash the process
// const on = (event, handler) => {
//     eventBus.on(event, async (payload) => {
//         try {
//             await handler(payload);
//         } catch (err) {
//             logger.error({ event: `LISTENER_ERROR:${event}`, error: err.message, stack: err.stack });
//         }
//     });
// };

// // ─── Payroll events ───────────────────────────────────────────────────────────

// on('PAYROLL_PROCESSED', async ({ results = [], month, year, totalAmount }) => {
//     for (const { employeeId, payrollId, netSalary } of results) {
//         await dispatch({
//             userId: employeeId,
//             type: 'PAYROLL_PROCESSED',
//             data: { payrollId, netSalary, month, year, totalAmount },
//         });
//     }
// });

// on('PAYROLL_LOCKED', async ({ payroll, actorId }) => {
//     await dispatch({
//         userId: payroll.employeeId,
//         type: 'PAYROLL_LOCKED',
//         data: {
//             payrollId: payroll.id,
//             month: payroll.month,
//             year: payroll.year,
//             netSalary: payroll.netSalary,
//         },
//     });
// });

// // ─── Leave events ─────────────────────────────────────────────────────────────

// on('LEAVE_REQUESTED', async ({ leaveRequest, employee, manager }) => {
//     // Notify employee their request was received
//     await dispatch({
//         userId: employee.id,
//         type: 'LEAVE_REQUESTED',
//         data: {
//             leaveType: leaveRequest.leaveType,
//             startDate: leaveRequest.startDate,
//             endDate: leaveRequest.endDate,
//             days: leaveRequest.days,
//         },
//     });

//     // Notify manager action required
//     if (manager?.id) {
//         await dispatch({
//             userId: manager.id,
//             type: 'LEAVE_PENDING_APPROVAL',
//             data: {
//                 managerName: `${manager.firstName} ${manager.lastName}`,
//                 employeeName: `${employee.firstName} ${employee.lastName}`,
//                 leaveType: leaveRequest.leaveType,
//                 startDate: leaveRequest.startDate,
//                 endDate: leaveRequest.endDate,
//                 days: leaveRequest.days,
//                 leaveId: leaveRequest.id,
//             },
//         });
//     }
// });

// on('LEAVE_APPROVED', async ({ leaveRequest, employee, approver }) => {
//     await dispatch({
//         userId: employee.id,
//         type: 'LEAVE_APPROVED',
//         data: {
//             leaveType: leaveRequest.leaveType,
//             startDate: leaveRequest.startDate,
//             endDate: leaveRequest.endDate,
//             days: leaveRequest.days,
//             approverName: approver ? `${approver.firstName} ${approver.lastName}` : '',
//             leaveId: leaveRequest.id,
//         },
//     });
// });

// on('LEAVE_REJECTED', async ({ leaveRequest, employee, reason }) => {
//     await dispatch({
//         userId: employee.id,
//         type: 'LEAVE_REJECTED',
//         data: {
//             leaveType: leaveRequest.leaveType,
//             startDate: leaveRequest.startDate,
//             endDate: leaveRequest.endDate,
//             reason: reason || '',
//             leaveId: leaveRequest.id,
//         },
//     });
// });

// // ─── Attendance events ────────────────────────────────────────────────────────

// on('ATTENDANCE_CHECKED_IN_LATE', async ({ employeeId, date, lateMinutes }) => {
//     await dispatch({
//         userId: employeeId,
//         type: 'ATTENDANCE_LATE',
//         data: { date, lateMinutes },
//     });
// });

// on('ATTENDANCE_MARKED_ABSENT', async ({ employeeId, date }) => {
//     await dispatch({
//         userId: employeeId,
//         type: 'ATTENDANCE_ABSENT',
//         data: { date },
//     });
// });

// // ─── Expense events ───────────────────────────────────────────────────────────

// on('EXPENSE_SUBMITTED', async ({ expense, employee }) => {
//     await dispatch({
//         userId: employee.id,
//         type: 'EXPENSE_SUBMITTED',
//         data: {
//             expenseId: expense.id,
//             amount: expense.amount,
//             category: expense.category,
//         },
//     });
// });

// on('EXPENSE_APPROVED', async ({ expense, employee }) => {
//     await dispatch({
//         userId: employee.id,
//         type: 'EXPENSE_APPROVED',
//         data: { expenseId: expense.id, amount: expense.amount },
//     });
// });

// on('EXPENSE_REJECTED', async ({ expense, employee, reason }) => {
//     await dispatch({
//         userId: employee.id,
//         type: 'EXPENSE_REJECTED',
//         data: { expenseId: expense.id, amount: expense.amount, reason },
//     });
// });

// // ─── Security events ──────────────────────────────────────────────────────────

// on('USER_LOGIN', async ({ userId, ip, device, time }) => {
//     await dispatch({
//         userId,
//         type: 'SECURITY_LOGIN',
//         skipPreferenceCheck: true,   // always send security alerts
//         data: { ip, device, time: time || new Date().toLocaleString('en-IN') },
//     });
// });

// // ─── Announcement (broadcast) ─────────────────────────────────────────────────

// on('ANNOUNCEMENT', async ({ userIds, title, message, from }) => {
//     await dispatchBulk(userIds, {
//         type: 'ANNOUNCEMENT',
//         data: { title, message, from },
//     });
// });

// // ─── Generic SEND_NOTIFICATION (legacy support) ───────────────────────────────
// on('SEND_NOTIFICATION', async ({ userId, payload }) => {
//     await dispatch({
//         userId,
//         type: payload.type || 'SYSTEM',
//         message: payload.message,
//         data: payload,
//     });
// });

// logger.info('Notification listeners registered');
'use strict';

/**
 * src/modules/notification/notificationListener.js
 */

const eventBus = require('../../utils/Eventbus');
const { dispatch, dispatchBulk } = require('./notificationDispatcher');
const logger = require('../../config/logger');

// ─────────────────────────────────────────────────────────────
// Safety wrapper — prevents crashes
// ─────────────────────────────────────────────────────────────
const on = (event, handler) => {
    eventBus.on(event, async (payload) => {
        try {
            if (!payload || typeof payload !== 'object') {
                logger.warn({ event: `INVALID_PAYLOAD:${event}`, payload });
                return;
            }

            await handler(payload);
        } catch (err) {
            logger.error({
                event: `LISTENER_ERROR:${event}`,
                error: err.message,
                stack: err.stack,
                payload,
            });
        }
    });
};

// ─────────────────────────────────────────────────────────────
// Payroll events
// ─────────────────────────────────────────────────────────────

on('PAYROLL_PROCESSED', async ({ results = [], month, year, totalAmount }) => {
    if (!Array.isArray(results) || results.length === 0) return;

    await Promise.allSettled(
        results.map(({ employeeId, payrollId, netSalary }) =>
            dispatch({
                userId: employeeId,
                type: 'PAYROLL_PROCESSED',
                data: { payrollId, netSalary, month, year, totalAmount },
            })
        )
    );
});

on('PAYROLL_LOCKED', async ({ payroll }) => {
    if (!payroll?.employeeId) return;

    await dispatch({
        userId: payroll.employeeId,
        type: 'PAYROLL_LOCKED',
        data: {
            payrollId: payroll.id,
            month: payroll.month,
            year: payroll.year,
            netSalary: payroll.netSalary,
        },
    });
});

// ─────────────────────────────────────────────────────────────
// Leave events
// ─────────────────────────────────────────────────────────────

on('LEAVE_REQUESTED', async ({ leaveRequest, employee, manager }) => {
    console.log('👂 LISTENER TRIGGERED');

    if (!leaveRequest || !employee?.id) return;

    const baseData = {
        leaveType: leaveRequest.leaveType,
        startDate: leaveRequest.startDate,
        endDate: leaveRequest.endDate,
        days: leaveRequest.daysRequested, // ✅ FIXED
        leaveId: leaveRequest.id,
    };

    // Employee
    await dispatch({
        userId: employee.id,
        type: 'LEAVE_REQUESTED',
        data: baseData,
    });

    // Manager
    if (manager?.id) {
        await dispatch({
            userId: manager.id,
            type: 'LEAVE_PENDING_APPROVAL',
            data: {
                ...baseData,
                managerName: `${manager.firstName} ${manager.lastName}`,
                employeeName: `${employee.firstName} ${employee.lastName}`,
                escalatable: true,
            },
        });
    }
});

on('LEAVE_APPROVED', async ({ leaveRequest, employee, approver }) => {
    if (!leaveRequest || !employee?.id) return;

    await dispatch({
        userId: employee.id,
        type: 'LEAVE_APPROVED',
        data: {
            leaveType: leaveRequest.leaveType,
            startDate: leaveRequest.startDate,
            endDate: leaveRequest.endDate,
            days: leaveRequest.days,
            leaveId: leaveRequest.id,
            approverName: approver
                ? `${approver.firstName} ${approver.lastName}`
                : '',
        },
    });
});

on('LEAVE_REJECTED', async ({ leaveRequest, employee, reason }) => {
    if (!leaveRequest || !employee?.id) return;

    await dispatch({
        userId: employee.id,
        type: 'LEAVE_REJECTED',
        data: {
            leaveType: leaveRequest.leaveType,
            startDate: leaveRequest.startDate,
            endDate: leaveRequest.endDate,
            leaveId: leaveRequest.id,
            reason: reason || '',
        },
    });
});

// ─────────────────────────────────────────────────────────────
// Attendance events
// ─────────────────────────────────────────────────────────────

on('ATTENDANCE_CHECKED_IN_LATE', async ({ employeeId, date, lateMinutes }) => {
    if (!employeeId) return;

    await dispatch({
        userId: employeeId,
        type: 'ATTENDANCE_LATE',
        data: { date, lateMinutes },
    });
});

on('ATTENDANCE_MARKED_ABSENT', async ({ employeeId, date }) => {
    if (!employeeId) return;

    await dispatch({
        userId: employeeId,
        type: 'ATTENDANCE_ABSENT',
        data: { date },
    });
});

// ─────────────────────────────────────────────────────────────
// Expense events
// ─────────────────────────────────────────────────────────────

on('EXPENSE_SUBMITTED', async ({ expense, employee }) => {
    if (!expense || !employee?.id) return;

    await dispatch({
        userId: employee.id,
        type: 'EXPENSE_SUBMITTED',
        data: {
            expenseId: expense.id,
            amount: expense.amount,
            category: expense.category,
        },
    });
});

on('EXPENSE_APPROVED', async ({ expense, employee }) => {
    if (!expense || !employee?.id) return;

    await dispatch({
        userId: employee.id,
        type: 'EXPENSE_APPROVED',
        data: {
            expenseId: expense.id,
            amount: expense.amount,
        },
    });
});

on('EXPENSE_REJECTED', async ({ expense, employee, reason }) => {
    if (!expense || !employee?.id) return;

    await dispatch({
        userId: employee.id,
        type: 'EXPENSE_REJECTED',
        data: {
            expenseId: expense.id,
            amount: expense.amount,
            reason: reason || '',
        },
    });
});

// ─────────────────────────────────────────────────────────────
// Security events
// ─────────────────────────────────────────────────────────────

on('USER_LOGIN', async ({ userId, ip, device, time }) => {
    if (!userId) return;

    await dispatch({
        userId,
        type: 'SECURITY_LOGIN',
        skipPreferenceCheck: true,
        data: {
            ip,
            device,
            time: time || new Date().toLocaleString('en-IN'),
        },
    });
});

// ─────────────────────────────────────────────────────────────
// Announcement (bulk)
// ─────────────────────────────────────────────────────────────

on('ANNOUNCEMENT', async ({ userIds, title, message, from }) => {
    if (!Array.isArray(userIds) || userIds.length === 0) return;

    await dispatchBulk(userIds, {
        type: 'ANNOUNCEMENT',
        data: { title, message, from },
    });
});

// ─────────────────────────────────────────────────────────────
// Generic fallback
// ─────────────────────────────────────────────────────────────

on('SEND_NOTIFICATION', async ({ userId, payload }) => {
    if (!userId || !payload) return;

    await dispatch({
        userId,
        type: payload.type || 'SYSTEM',
        message: payload.message,
        data: payload,
    });
});

