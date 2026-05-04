'use strict';

const { LeaveBalance, LeaveRequest, User } = require('../../database/initModels');
const { Op } = require('sequelize');
const sequelize = require('../../database/sequelize');
const logger = require('../../config/logger');

const LEAVE_ENTITLEMENTS = {
    CASUAL: 12,
    SICK: 12,
    PAID: 15,
    UNPAID: 999, // unlimited unpaid
};

/**
 * Ensure a LeaveBalance row exists for a user+year.
 * Safe to call multiple times (upsert pattern).
 */
const ensureLeaveBalance = async (employeeId, year, transaction = null) => {
    const [balance] = await LeaveBalance.findOrCreate({
        where: { employeeId, year },
        defaults: {
            employeeId,
            year,
            casualTotal: LEAVE_ENTITLEMENTS.CASUAL,
            casualUsed: 0,
            sickTotal: LEAVE_ENTITLEMENTS.SICK,
            sickUsed: 0,
            paidTotal: LEAVE_ENTITLEMENTS.PAID,
            paidUsed: 0,
            unpaidUsed: 0,
        },
        transaction,
    });
    return balance;
};

/**
 * Recalculate leave balance from scratch for one employee.
 * Called after approve / reject / cancel.
 */
const recalculateBalance = async (employeeId, year) => {
    return sequelize.transaction(async (t) => {
        const balance = await ensureLeaveBalance(employeeId, year, t);

        const approved = await LeaveRequest.findAll({
            where: {
                employeeId,
                status: 'Approved',
                startDate: { [Op.gte]: `${year}-01-01` },
                endDate: { [Op.lte]: `${year}-12-31` },
            },
            transaction: t,
        });

        const used = { CASUAL: 0, SICK: 0, PAID: 0, UNPAID: 0 };

        for (const req of approved) {
            const type = req.leaveType?.toUpperCase();
            if (used[type] !== undefined) {
                used[type] += Number(req.daysRequested);
            }
        }

        await balance.update({
            casualUsed: used.CASUAL,
            sickUsed: used.SICK,
            paidUsed: used.PAID,
            unpaidUsed: used.UNPAID,
        }, { transaction: t });

        logger.info({ event: 'LEAVE_BALANCE_RECALC', employeeId, year, used });

        return balance;
    });
};

/**
 * Year-end reset: carry forward unused paid leaves (max 5), zero rest.
 * Run via cron on Jan 1.
 */
const yearEndReset = async (fromYear) => {
    const toYear = fromYear + 1;
    const allBalances = await LeaveBalance.findAll({ where: { year: fromYear } });

    let processed = 0;
    for (const bal of allBalances) {
        const carryForward = Math.min(
            bal.paidTotal - bal.paidUsed,
            5 // max carry forward
        );

        await LeaveBalance.upsert({
            employeeId: bal.employeeId,
            year: toYear,
            casualTotal: LEAVE_ENTITLEMENTS.CASUAL,
            casualUsed: 0,
            sickTotal: LEAVE_ENTITLEMENTS.SICK,
            sickUsed: 0,
            paidTotal: LEAVE_ENTITLEMENTS.PAID + Math.max(0, carryForward),
            paidUsed: 0,
            unpaidUsed: 0,
        });

        processed++;
    }

    logger.info({ event: 'YEAR_END_LEAVE_RESET', fromYear, toYear, processed });
    return { processed };
};

/**
 * Provision leave balances for all active employees for current year.
 * Safe to run multiple times — findOrCreate is idempotent.
 */
const provisionAllEmployees = async () => {
    const year = new Date().getFullYear();
    const employees = await User.findAll({ where: { isActive: true } });

    let provisioned = 0;
    for (const emp of employees) {
        await ensureLeaveBalance(emp.id, year);
        provisioned++;
    }

    logger.info({ event: 'LEAVE_BALANCE_PROVISION', year, provisioned });
    return { provisioned };
};

module.exports = {
    ensureLeaveBalance,
    recalculateBalance,
    yearEndReset,
    provisionAllEmployees,
};