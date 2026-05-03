
'use strict';

const { Op } = require('sequelize');
const { Shift, ShiftAssignment, User } = require('../../database/initModels');
const { assertPermission } = require('../../utils/Permissions');
const { logAuditEvent } = require('../../utils/auditLogger');
const logger = require('../../config/logger');

// ─── helpers ───────────────────────────────────────────

const fail = (message, statusCode = 400) => ({
    success: false,
    message,
    statusCode,
});

const checkPerm = (actor, perm) => {
    const r = assertPermission(actor, perm);
    if (!r.allowed) return fail(r.message || 'Forbidden', 403);
    return null;
};

const getCompanyId = (actor) => {
    const companyId = actor?.companyId;
    if (!companyId) {
        throw new Error('companyId missing in actor');
    }
    return companyId;
};

// ─── SHIFT CRUD ───────────────────────────────────────

const createShift = async ({ actor, data }) => {
    const denied = checkPerm(actor, 'MANAGE_SHIFTS');
    if (denied) return denied;

    try {
        const companyId = getCompanyId(actor);

        const shift = await Shift.create({
            ...data,
            companyId,
        });

        await logAuditEvent({
            userId: actor.id,
            moduleName: 'Shift',
            actionType: 'CREATE',
            oldData: null,
            newData: shift,
            ipAddress: actor.ip,
        });

        return { success: true, statusCode: 201, data: shift };
    } catch (err) {
        logger.error({ event: 'CREATE_SHIFT_FAILED', error: err.message });
        return fail(err.message || 'Failed to create shift', 500);
    }
};

const updateShift = async ({ actor, shiftId, data }) => {
    const denied = checkPerm(actor, 'MANAGE_SHIFTS');
    if (denied) return denied;

    try {
        const companyId = getCompanyId(actor);

        const shift = await Shift.findOne({
            where: { id: shiftId, companyId },
        });

        if (!shift) return fail('Shift not found', 404);

        const old = shift.toJSON();

        await shift.update(data);

        await logAuditEvent({
            userId: actor.id,
            moduleName: 'Shift',
            actionType: 'UPDATE',
            oldData: old,
            newData: shift,
            ipAddress: actor.ip,
        });

        return { success: true, data: shift };
    } catch (err) {
        logger.error({ event: 'UPDATE_SHIFT_FAILED', error: err.message });
        return fail(err.message || 'Failed to update shift', 500);
    }
};

const deleteShift = async ({ actor, shiftId }) => {
    const denied = checkPerm(actor, 'MANAGE_SHIFTS');
    if (denied) return denied;

    try {
        const companyId = getCompanyId(actor);

        const shift = await Shift.findOne({
            where: { id: shiftId, companyId },
        });

        if (!shift) return fail('Shift not found', 404);

        const activeAssignments = await ShiftAssignment.count({
            where: { shiftId, companyId, isActive: true },
        });

        if (activeAssignments > 0) {
            return fail(
                'Cannot delete shift with active employee assignments.',
                409
            );
        }

        await shift.destroy();

        return { success: true, message: 'Shift deleted' };
    } catch (err) {
        logger.error({ event: 'DELETE_SHIFT_FAILED', error: err.message });
        return fail(err.message || 'Failed to delete shift', 500);
    }
};

const listShifts = async ({ actor }) => {
    const denied = checkPerm(actor, 'VIEW_SHIFTS');
    if (denied) return denied;

    try {
        const companyId = getCompanyId(actor);

        const data = await Shift.findAll({
            where: { companyId, isActive: true },
            order: [['name', 'ASC']],
        });

        return { success: true, data };
    } catch (err) {
        logger.error({ event: 'LIST_SHIFTS_FAILED', error: err.message });
        return fail('Failed to fetch shifts', 500);
    }
};

// ─── SHIFT ASSIGNMENT ─────────────────────────────────

const assignShift = async ({ actor, data }) => {
    const denied = checkPerm(actor, 'ASSIGN_SHIFT');
    if (denied) return denied;

    try {
        const companyId = getCompanyId(actor);

        // deactivate old assignment
        await ShiftAssignment.update(
            {
                isActive: false,
                effectiveTo: new Date(data.effectiveFrom),
            },
            {
                where: {
                    employeeId: data.employeeId,
                    companyId,
                    isActive: true,
                },
            }
        );

        const assignment = await ShiftAssignment.create({
            ...data,
            companyId,
            assignedBy: actor.id,
            isActive: true,
        });

        await logAuditEvent({
            userId: actor.id,
            moduleName: 'ShiftAssignment',
            actionType: 'CREATE',
            oldData: null,
            newData: assignment,
            ipAddress: actor.ip,
        });

        return { success: true, statusCode: 201, data: assignment };
    } catch (err) {
        logger.error({ event: 'ASSIGN_SHIFT_FAILED', error: err.message });
        return fail(err.message || 'Failed to assign shift', 500);
    }
};

// ─── GET EMPLOYEE SHIFT ───────────────────────────────

const getEmployeeShift = async ({ actor, employeeId, date }) => {
    const companyId = getCompanyId(actor);

    const assignment = await ShiftAssignment.findOne({
        where: {
            employeeId,
            companyId,
            isActive: true,
            effectiveFrom: { [Op.lte]: date },
            [Op.or]: [
                { effectiveTo: null },
                { effectiveTo: { [Op.gte]: date } },
            ],
        },
        include: [{ model: Shift, as: 'shift' }],
        order: [['effectiveFrom', 'DESC']],
    });

    if (!assignment?.shift) {
        return {
            startTime: '09:00',
            endTime: '18:00',
            graceMins: 15,
            overtimeAfterMins: 0,
            overtimeRateMultiplier: 1.5,
            workDays: [1, 2, 3, 4, 5],
            isNightShift: false,
            isDefault: true,
        };
    }

    return { ...assignment.shift.toJSON(), isDefault: false };
};

// ─── SHIFT HISTORY ────────────────────────────────────

const getEmployeeShiftHistory = async ({ actor, employeeId }) => {
    const denied = checkPerm(actor, 'VIEW_SHIFTS');
    if (denied) return denied;

    try {
        const companyId = getCompanyId(actor);

        const data = await ShiftAssignment.findAll({
            where: { employeeId, companyId },
            include: [
                {
                    model: Shift,
                    as: 'shift',
                    attributes: ['id', 'name', 'startTime', 'endTime'],
                },
                {
                    model: User,
                    as: 'assignor',
                    attributes: ['id', 'firstName', 'lastName'],
                },
            ],
            order: [['effectiveFrom', 'DESC']],
        });

        return { success: true, data };
    } catch (err) {
        logger.error({ event: 'GET_SHIFT_HISTORY_FAILED', error: err.message });
        return fail('Failed to fetch shift history', 500);
    }
};

// ─── SHIFT REPORT ─────────────────────────────────────

const getShiftReport = async ({ actor }) => {
    const denied = checkPerm(actor, 'VIEW_SHIFT_REPORT');
    if (denied) return denied;

    try {
        const companyId = getCompanyId(actor);

        const assignments = await ShiftAssignment.findAll({
            where: { isActive: true, companyId },
            include: [
                {
                    model: User,
                    as: 'employee',
                    attributes: [
                        'id',
                        'firstName',
                        'lastName',
                        'employeeCode',
                        'department',
                    ],
                    where: { companyId },
                },
                {
                    model: Shift,
                    as: 'shift',
                    attributes: ['id', 'name', 'startTime', 'endTime'],
                },
            ],
            order: [['effectiveFrom', 'DESC']],
        });

        return { success: true, data: assignments };
    } catch (err) {
        logger.error({ event: 'SHIFT_REPORT_FAILED', error: err.message });
        return fail('Failed to generate shift report', 500);
    }
};


const calcMetricsWithShift = (checkIn, checkOut, shift) => {
    const toMins = (t) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    };

    const cinM = toMins(checkIn);
    const coutM = toMins(checkOut);

    const shiftStartM = toMins(shift.startTime);
    const shiftEndM = toMins(shift.endTime);
    const standardM = shiftEndM - shiftStartM;

    let workedMinutes = coutM - cinM;

    if (shift.isNightShift && workedMinutes < 0) {
        workedMinutes += 24 * 60;
    }

    if (workedMinutes <= 0) {
        throw Object.assign(
            new Error('Check-out time must be after check-in'),
            { statusCode: 400 }
        );
    }

    const isLate = cinM > (shiftStartM + shift.graceMins);
    const lateMinutes = isLate ? cinM - shiftStartM : 0;

    const overtimeMinutes = Math.max(
        0,
        workedMinutes - standardM - (shift.overtimeAfterMins || 0)
    );

    const hasOvertime = overtimeMinutes > 0;

    let status;
    if (workedMinutes < standardM / 2) status = 'half_day';
    else if (isLate) status = 'late';
    else status = 'present';

    return {
        workedMinutes,
        isLate,
        lateMinutes,
        overtimeMinutes,
        hasOvertime,
        status,
        overtimePay: hasOvertime
            ? overtimeMinutes * shift.overtimeRateMultiplier
            : 0,
    };
};


module.exports = {
    createShift,
    calcMetricsWithShift,
    updateShift,
    deleteShift,
    listShifts,
    assignShift,
    getEmployeeShift,
    getEmployeeShiftHistory,
    getShiftReport,
};