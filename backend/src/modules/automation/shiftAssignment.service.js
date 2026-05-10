'use strict';

const { User, Shift } = require('../../database/initModels');
const logger = require('../../config/logger');

/**
 * Default shifts — these should exist in your shifts table.
 * Names must match exactly.
 */
const DEFAULT_SHIFT_RULES = [
    { departments: ['Engineering', 'Product'], shiftName: 'Morning' },
    { departments: ['Sales', 'Support'], shiftName: 'General' },
    { departments: ['Operations'], shiftName: 'Night' },
];

const FALLBACK_SHIFT = 'General';

/**
 * Auto-assign shift to a newly registered employee
 * based on their department.
 */
const assignShiftOnRegister = async (userId, department) => {
    try {
        const rule = DEFAULT_SHIFT_RULES.find(r =>
            r.departments.some(d => d.toLowerCase() === (department || '').toLowerCase())
        );

        const shiftName = rule?.shiftName ?? FALLBACK_SHIFT;

        const shift = await Shift.findOne({ where: { name: shiftName } });
        if (!shift) {
            logger.warn({ event: 'SHIFT_NOT_FOUND', shiftName, userId });
            return;
        }

        await User.update({ shiftId: shift.id }, { where: { id: userId } });

        logger.info({ event: 'SHIFT_AUTO_ASSIGNED', userId, department, shiftName });
        return shift;
    } catch (err) {
        logger.error({ event: 'SHIFT_ASSIGN_ERROR', userId, error: err.message });
    }
};

/**
 * Bulk re-assign shifts for all active employees
 * who currently have no shift set.
 * Safe to run via cron.
 */
const assignMissingShifts = async () => {
    const unassigned = await User.findAll({
        where: { isActive: true, shiftId: null },
    });

    let assigned = 0;
    for (const user of unassigned) {
        await assignShiftOnRegister(user.id, user.department);
        assigned++;
    }

    logger.info({ event: 'BULK_SHIFT_ASSIGN', assigned });
    return { assigned };
};

module.exports = { assignShiftOnRegister, assignMissingShifts };