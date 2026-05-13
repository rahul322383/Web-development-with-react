'use strict';

const { User, Shift } = require('../../database/initModels');

const DEFAULT_SHIFT_RULES = [
    { departments: ['Engineering', 'Product'], shiftName: 'Morning' },
    { departments: ['Sales', 'Support'], shiftName: 'General' },
    { departments: ['Operations'], shiftName: 'Night' },
];

const FALLBACK_SHIFT = 'General';

const assignShiftOnRegister = async (userId, department) => {
    try {
        const rule = DEFAULT_SHIFT_RULES.find(r =>
            r.departments.some(d => d.toLowerCase() === (department || '').toLowerCase())
        );

        const shiftName = rule?.shiftName ?? FALLBACK_SHIFT;

        const shift = await Shift.findOne({ where: { name: shiftName } });
        if (!shift) return;

        await User.update({ shiftId: shift.id }, { where: { id: userId } });

        return shift;
    } catch (err) {
        // silent
    }
};

const assignMissingShifts = async () => {
    const unassigned = await User.findAll({
        where: { isActive: true, shiftId: null },
    });

    let assigned = 0;
    for (const user of unassigned) {
        await assignShiftOnRegister(user.id, user.department);
        assigned++;
    }

    return { assigned };
};

module.exports = { assignShiftOnRegister, assignMissingShifts };