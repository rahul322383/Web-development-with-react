'use strict';

const { Op } = require('sequelize');
const {
    Shift,
    ShiftAssignment,
    User,
} = require('../../database/initModels');

const { assertPermission } = require('../../utils/Permissions');
const { logAuditEvent } = require('../../utils/auditLogger');
const eventBus = require('../../utils/Eventbus');

const response = (message, statusCode = 400) => ({
    success: false,
    message,
    statusCode,
});

const checkPerm = (actor, perm) => {
    const result = assertPermission(actor, perm);
    if (!result.allowed) {
        return response(result.message || 'Forbidden', 403);
    }
    return null;
};

const resolveCompanyId = (actor) =>
    actor?.companyId ?? actor?.company_id ?? null;

const requireCompanyId = (actor) => {
    const companyId = resolveCompanyId(actor);
    if (!companyId) {
        return response(
            'Your session is missing companyId. Please log out and log in again.',
            422
        );
    }
    return companyId;
};

const createShift = async ({ actor, data }) => {
    const denied = checkPerm(actor, 'MANAGE_SHIFTS');
    if (denied) return denied;

    const companyIdOrFail = requireCompanyId(actor);
    if (typeof companyIdOrFail === 'object') return companyIdOrFail;
    const companyId = companyIdOrFail;

    try {
        const shift = await Shift.create({ ...data, companyId });

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
        return response(err.message || 'Failed to create shift', 500);
    }
};

const updateShift = async ({ actor, shiftId, data }) => {
    const denied = checkPerm(actor, 'MANAGE_SHIFTS');
    if (denied) return denied;

    const companyIdOrFail = requireCompanyId(actor);
    if (typeof companyIdOrFail === 'object') return companyIdOrFail;
    const companyId = companyIdOrFail;

    try {
        const shift = await Shift.findOne({ where: { id: shiftId, companyId } });
        if (!shift) return response('Shift not found', 404);

        const oldData = shift.toJSON();
        await shift.update(data);

        await logAuditEvent({
            userId: actor.id,
            moduleName: 'Shift',
            actionType: 'UPDATE',
            oldData,
            newData: shift,
            ipAddress: actor.ip,
        });

        return { success: true, data: shift };
    } catch (err) {
        return response(err.message || 'Failed to update shift', 500);
    }
};

const deleteShift = async ({ actor, shiftId }) => {
    const denied = checkPerm(actor, 'MANAGE_SHIFTS');
    if (denied) return denied;

    const companyIdOrFail = requireCompanyId(actor);
    if (typeof companyIdOrFail === 'object') return companyIdOrFail;
    const companyId = companyIdOrFail;

    try {
        const shift = await Shift.findOne({ where: { id: shiftId, companyId } });
        if (!shift) return response('Shift not found', 404);

        const activeAssignments = await ShiftAssignment.count({
            where: { shiftId, isActive: true },
        });

        if (activeAssignments > 0) {
            return response(
                'Cannot delete shift with active employee assignments. Reassign employees first.',
                409
            );
        }

        await shift.destroy();
        return { success: true, message: 'Shift deleted' };
    } catch (err) {
        return response(err.message || 'Failed to delete shift', 500);
    }
};

const listShifts = async ({ actor }) => {
    const denied = checkPerm(actor, 'VIEW_SHIFTS');
    if (denied) return denied;

    const companyIdOrFail = requireCompanyId(actor);
    if (typeof companyIdOrFail === 'object') return companyIdOrFail;
    const companyId = companyIdOrFail;

    try {
        const data = await Shift.findAll({
            where: { companyId, isActive: true },
            order: [['name', 'ASC']],
        });

        return { success: true, data };
    } catch (err) {
        return response('Failed to fetch shifts', 500);
    }
};

const assignShift = async ({ actor, data }) => {
    const denied = checkPerm(actor, 'ASSIGN_SHIFT');
    if (denied) return denied;

    const companyIdOrFail = requireCompanyId(actor);
    if (typeof companyIdOrFail === 'object') return companyIdOrFail;
    const companyId = companyIdOrFail;

    try {
        const employee = await User.findOne({ where: { id: data.employeeId, companyId } });
        if (!employee) return response('Employee not found', 404);

        const shift = await Shift.findOne({ where: { id: data.shiftId, companyId, isActive: true } });
        if (!shift) return response('Shift not found', 404);

        await ShiftAssignment.update(
            { isActive: false, effectiveTo: data.effectiveFrom },
            { where: { employeeId: data.employeeId, companyId, isActive: true } }
        );

        const assignment = await ShiftAssignment.create({
            companyId,
            employeeId: data.employeeId,
            shiftId: data.shiftId,
            assignedBy: actor.id,
            effectiveFrom: data.effectiveFrom,
            effectiveTo: data.effectiveTo || null,
            notes: data.notes || null,
            isActive: true,
        });

        await employee.update({ shiftId: shift.id });

        await logAuditEvent({
            userId: actor.id,
            moduleName: 'ShiftAssignment',
            actionType: 'CREATE',
            oldData: null,
            newData: assignment.toJSON(),
            ipAddress: actor.ip,
        });

        eventBus.emit('SEND_NOTIFICATION', {
            userId: employee.id,
            payload: {
                type: 'SYSTEM',
                title: 'Shift Assigned',
                message: `A new shift "${shift.name}" has been assigned to you.`,
                shiftName: shift.name,
                startTime: shift.startTime,
                endTime: shift.endTime,
                effectiveFrom: data.effectiveFrom,
            },
        });

        return {
            success: true,
            statusCode: 201,
            message: 'Shift assigned successfully',
            data: assignment,
        };
    } catch (err) {
        return response(err.message || 'Failed to assign shift', 500);
    }
};

const DEFAULT_SHIFT = {
    startTime: '09:00',
    endTime: '18:00',
    graceMins: 15,
    breakDurationMins: 0,
    overtimeAfterMins: 0,
    overtimeRateMultiplier: 1.5,
    workDays: [1, 2, 3, 4, 5],
    isNightShift: false,
    isDefault: true,
};

const getEmployeeShift = async (employeeId, date) => {
    try {
        const assignment = await ShiftAssignment.findOne({
            where: {
                employeeId,
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

        if (!assignment?.shift) return DEFAULT_SHIFT;

        return { ...assignment.shift.toJSON(), isDefault: false };
    } catch (err) {
        return DEFAULT_SHIFT;
    }
};

const getEmployeeShiftHistory = async ({ actor, employeeId }) => {
    const denied = checkPerm(actor, 'VIEW_SHIFTS');
    if (denied) return denied;

    const companyIdOrFail = requireCompanyId(actor);
    if (typeof companyIdOrFail === 'object') return companyIdOrFail;
    const companyId = companyIdOrFail;

    try {
        const employee = await User.findOne({ where: { id: employeeId, companyId } });
        if (!employee) return response('Employee not found', 404);

        const data = await ShiftAssignment.findAll({
            where: { employeeId },
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
        return response('Failed to fetch shift history', 500);
    }
};

const getShiftReport = async ({ actor }) => {
    const denied = checkPerm(actor, 'VIEW_SHIFT_REPORT');
    if (denied) return denied;

    const companyIdOrFail = requireCompanyId(actor);
    if (typeof companyIdOrFail === 'object') return companyIdOrFail;
    const companyId = companyIdOrFail;

    try {
        const assignments = await ShiftAssignment.findAll({
            where: { isActive: true },
            include: [
                {
                    model: User,
                    as: 'employee',
                    attributes: ['id', 'firstName', 'lastName', 'employeeCode', 'department'],
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
        return response('Failed to generate shift report', 500);
    }
};

const calcMetricsWithShift = (checkIn, checkOut, shift) => {
    const toMins = (time) => {
        const [h, m] = time.split(':').map(Number);
        return h * 60 + m;
    };

    const cinM = toMins(checkIn);
    const coutM = toMins(checkOut);
    const shiftStartM = toMins(shift.startTime ?? '09:00');
    const shiftEndM = toMins(shift.endTime ?? '18:00');
    const graceMins = shift.graceMins ?? 15;
    const otAfter = shift.overtimeAfterMins ?? 0;
    const otRate = shift.overtimeRateMultiplier ?? 1.5;
    const standardM = shiftEndM - shiftStartM;

    let workedMinutes = coutM - cinM;

    if (workedMinutes < 0) workedMinutes += 24 * 60;

    if (workedMinutes <= 0) {
        throw Object.assign(
            new Error('Check-out time must be after check-in'),
            { statusCode: 400 }
        );
    }

    const isLate = cinM > shiftStartM + graceMins;
    const lateMinutes = isLate ? cinM - shiftStartM : 0;
    const overtimeMinutes = Math.max(0, workedMinutes - standardM - otAfter);
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
        overtimePay: hasOvertime ? overtimeMinutes * otRate : 0,
    };
};

module.exports = {
    createShift,
    updateShift,
    deleteShift,
    listShifts,
    assignShift,
    getEmployeeShift,
    getEmployeeShiftHistory,
    getShiftReport,
    calcMetricsWithShift,
};