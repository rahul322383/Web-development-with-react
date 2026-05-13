'use strict';

const { Attendance, User, Shift } = require('../../database/initModels');
const { Op } = require('sequelize');

const DEFAULT_SHIFT = {
    startTime: '09:00',
    endTime: '18:00',
    graceMins: 15,
};

const todayDate = () => new Date().toISOString().slice(0, 10);

const toTimeString = (date) => date.toTimeString().slice(0, 8);

const toMinutes = (time) => {
    if (!time) return 0;
    const [h, m] = time.split(':').map(Number);
    return (h * 60) + m;
};

const autoCheckIn = async ({ userId, ip }) => {
    try {
        const user = await User.findByPk(userId, {
            include: [{ model: Shift, as: 'shift' }],
        });

        if (!user || !user.isActive) return;
        if (!user.companyId) return;

        const now = new Date();
        const hour = now.getHours();

        if (hour < 5 || hour > 23) return;

        const date = todayDate();
        const checkInTime = toTimeString(now);

        let record = await Attendance.findOne({
            where: {
                employeeId: userId,
                companyId: user.companyId,
                date,
            },
        });

        if (record?.checkIn) return;

        const shift = user.shift || DEFAULT_SHIFT;
        const nowM = toMinutes(checkInTime);
        const shiftStartM = toMinutes(shift.startTime);

        let isLate = false;
        let lateMinutes = 0;
        let status = 'present';

        const diff = nowM - shiftStartM;

        if (diff > shift.graceMins) {
            isLate = true;
            lateMinutes = diff - shift.graceMins;
            status = 'late';
        }

        if (lateMinutes > 120) {
            status = 'half_day';
        }

        const payload = {
            employeeId: userId,
            companyId: user.companyId,
            date,
            checkIn: checkInTime,
            isLate,
            lateMinutes,
            status,
            checkInIp: ip || null,
        };

        if (record) {
            await record.update(payload);
        } else {
            await Attendance.create(payload);
        }

    } catch (err) {
        // silent
    }
};

const autoCheckOut = async ({ userId, ip }, transaction = null) => {
    try {

        console.log('========== AUTO CHECKOUT START ==========');
        console.log('User ID:', userId);

        const user = await User.findByPk(userId, { transaction });

        if (!user || !user.companyId) {
            console.log('User or company not found');

            return {
                success: false,
                message: 'User not found',
            };
        }

        const date = todayDate();
        const now = new Date();
        const checkOutTime = toTimeString(now);

        console.log('Checkout Time:', checkOutTime);

        const record = await Attendance.findOne({
            where: {
                employeeId: userId,
                companyId: user.companyId,
                date,
            },
            transaction,
            lock: transaction ? transaction.LOCK.UPDATE : undefined,
        });

        if (!record) {
            console.log('Attendance record not found');

            return {
                success: false,
                message: 'Attendance not found',
            };
        }

        if (record.checkOut) {
            console.log('Already checked out');

            return {
                success: false,
                message: 'Already checked out',
            };
        }

        if (!record.checkIn) {
            console.log('Checkin missing');

            return {
                success: false,
                message: 'Checkin missing',
            };
        }

        const checkInM = toMinutes(record.checkIn);
        const nowM = toMinutes(checkOutTime);

        let workedMinutes;

        if (nowM < checkInM) {
            workedMinutes = (1440 - checkInM) + nowM;
        } else {
            workedMinutes = nowM - checkInM;
        }

        console.log('Worked Minutes:', workedMinutes);

        if (workedMinutes < 5) {
            console.log('Minimum work duration not completed');

            return {
                success: false,
                message: 'Minimum work duration not completed',
            };
        }

        let status = record.status || 'present';

        if (workedMinutes >= 480) {
            status = 'present';
        } else if (workedMinutes >= 240) {
            status = 'half_day';
        } else {
            status = 'absent';
        }

        const overtimeMinutes = Math.max(0, workedMinutes - 480);

        await record.update(
            {
                checkOut: checkOutTime,
                workedMinutes,
                overtimeMinutes,
                hasOvertime: overtimeMinutes > 0,
                status,
                checkOutIp: ip || null,
            },
            { transaction }
        );

        console.log('Checkout updated successfully');

        console.log('========== AUTO CHECKOUT END ==========');

        return {
            success: true,
            message: 'Checkout successfully',
            data: {
                workedMinutes,
                overtimeMinutes,
                status,
                checkOutTime,
            },
        };

    } catch (err) {

        console.error('Auto Checkout Error:', err);

        return {
            success: false,
            message: 'Checkout failed',
            error: err.message,
        };
    }
};

module.exports = {
    autoCheckIn,
    autoCheckOut,
};