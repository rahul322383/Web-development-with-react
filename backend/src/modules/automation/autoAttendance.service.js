'use strict';

const { Attendance, User, Shift } = require('../../database/initModels');
const logger = require('../../config/logger');
const { Op } = require('sequelize');

// ✅ DEFAULT SHIFT (fallback)
const DEFAULT_SHIFT = {
    startTime: '09:00',
    endTime: '18:00',
    graceMins: 15,
};

// ======================
// 🔧 HELPERS
// ======================
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

        if (!user.companyId) {
            logger.warn({ event: 'NO_COMPANY_ID', userId });
            return;
        }

        const now = new Date();
        const hour = now.getHours();

        // ❌ block unrealistic login times
        if (hour < 5 || hour > 23) {
            logger.warn({
                event: 'AUTO_CHECKIN_BLOCKED',
                userId,
                hour,
            });
            return;
        }

        const date = todayDate();
        const checkInTime = toTimeString(now);

        // ✅ fetch existing attendance
        let record = await Attendance.findOne({
            where: {
                employeeId: userId,
                companyId: user.companyId,
                date,
            },
        });

        // ✅ already checked in
        if (record?.checkIn) {
            logger.info({ event: 'AUTO_CHECKIN_SKIP', userId });
            return;
        }

        // ✅ SHIFT (real or fallback)
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

        // ❗ too late → half day
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

      
        

        // ✅ UPSERT logic (safe)
        if (record) {
            await record.update(payload);
        } else {
            await Attendance.create(payload);
        }

    } catch (err) {
    
        logger.error({
            event: 'AUTO_CHECKIN_ERROR',
            userId,
            error: err.message,
        });
    }
};


const autoCheckOut = async ({ userId, ip }) => {
    try {
        const user = await User.findByPk(userId);

        if (!user || !user.companyId) {
            logger.warn(
                `AUTO_CHECKOUT_INVALID_USER: ${JSON.stringify(
                    { userId },
                    null,
                    2
                )}`
            );
            return;
        }

        const date = todayDate();
        const now = new Date();
        const checkOutTime = toTimeString(now);

        const record = await Attendance.findOne({
            where: {
                employeeId: userId,
                companyId: user.companyId,
                date,
            },
        });

        // No attendance found
        if (!record) {
            logger.warn(
                `AUTO_CHECKOUT_NO_RECORD: ${JSON.stringify(
                    { userId, date },
                    null,
                    2
                )}`
            );
            return;
        }

        // Already checked out
        if (record.checkOut) {
            logger.info(
                `AUTO_CHECKOUT_SKIP: ${JSON.stringify(
                    {
                        userId,
                        existingCheckOut: record.checkOut,
                    },
                    null,
                    2
                )}`
            );
            return;
        }

        // No check-in
        if (!record.checkIn) {
            logger.warn(
                `AUTO_CHECKOUT_NO_CHECKIN: ${JSON.stringify(
                    { userId },
                    null,
                    2
                )}`
            );
            return;
        }

        const checkInM = toMinutes(record.checkIn);
        const nowM = toMinutes(checkOutTime);

        // Night shift support
        let workedMinutes =
            nowM < checkInM
                ? (1440 - checkInM) + nowM
                : nowM - checkInM;

        // Fake session prevention
        if (workedMinutes < 30) {
            logger.warn(
                `INVALID_WORK_DURATION: ${JSON.stringify(
                    {
                        userId,
                        workedMinutes,
                    },
                    null,
                    2
                )}`
            );
            return;
        }

        let status = record.status;

        // Attendance status
        if (workedMinutes >= 480) {
            status = 'present';
        } else if (workedMinutes >= 240) {
            status = 'half_day';
        } else {
            status = 'absent';
        }

        const overtimeMinutes = Math.max(
            0,
            workedMinutes - 480
        );

        await record.update({
            checkOut: checkOutTime,
            workedMinutes,
            overtimeMinutes,
            hasOvertime: overtimeMinutes > 0,
            status,
            checkOutIp: ip || null,
        });

        logger.info(
            `AUTO_CHECKOUT_DONE: ${JSON.stringify(
                {
                    userId,
                    workedMinutes,
                    overtimeMinutes,
                    status,
                    checkOutTime,
                },
                null,
                2
            )}`
        );

    } catch (err) {
        logger.error(
            `AUTO_CHECKOUT_ERROR: ${JSON.stringify(
                {
                    userId,
                    error: err.message,
                    stack: err.stack,
                },
                null,
                2
            )}`
        );
    }
};

module.exports = {
    autoCheckIn,
    autoCheckOut,
};