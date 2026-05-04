'use strict';

const cron = require('node-cron');
const logger = require('../../config/logger');
const { Attendance, User } = require('../../database/initModels');
const { Op } = require('sequelize');
const { notify, templates } = require('./notification.service');
const { autoGeneratePayroll } = require('./payrollAuto.service');
const { yearEndReset, provisionAllEmployees } = require('./leaveBalance.service');
const { assignMissingShifts } = require('./shiftAssignment.service');

const todayDate = () => new Date().toISOString().slice(0, 10);


// ─────────────────────────────────────────────
// ✅ 1. MARK ABSENT (OPTIMIZED + FIXED)
// ─────────────────────────────────────────────
cron.schedule('55 23 * * 1-5', async () => {
    logger.info({ event: 'CRON_ABSENT_START' });

    try {
        const date = todayDate();

        // ✅ fetch all active employees WITH companyId
        const employees = await User.findAll({
            where: { isActive: true },
            attributes: ['id', 'email', 'firstName', 'lastName', 'companyId'],
        });

        if (!employees.length) return;

        // ✅ fetch all today's attendance in ONE QUERY
        const attendances = await Attendance.findAll({
            where: { date },
            attributes: ['employeeId', 'checkIn'],
        });

        const attendanceMap = new Map();
        attendances.forEach(a => {
            attendanceMap.set(a.employeeId, a);
        });

        const absentRecords = [];

        for (const emp of employees) {
            const record = attendanceMap.get(emp.id);

            if (!record || !record.checkIn) {
                absentRecords.push({
                    employeeId: emp.id,
                    companyId: emp.companyId, // ✅ FIXED
                    date,
                    status: 'absent',
                    checkInIp: null,
                });

                // 🔔 notification
                const name = `${emp.firstName} ${emp.lastName}`;
                const tmpl = templates.absentAlert({ name, date });

                await notify({
                    userId: emp.id,
                    email: emp.email,
                    subject: tmpl.subject,
                    html: tmpl.html,
                    socketPayload: {
                        type: 'MARKED_ABSENT',
                        title: 'Absent Today',
                        message: `No attendance recorded for ${date}`,
                        date,
                    },
                });
            }
        }

        // ✅ BULK UPSERT (FAST 🚀)
        if (absentRecords.length) {
            await Attendance.bulkCreate(absentRecords, {
                updateOnDuplicate: ['status', 'checkInIp'],
            });
        }

        logger.info({
            event: 'CRON_ABSENT_DONE',
            total: absentRecords.length,
        });

    } catch (err) {
        logger.error({
            event: 'CRON_ABSENT_ERROR',
            error: err.message,
            stack: err.stack,
        });
    }

}, { timezone: 'Asia/Kolkata' });


// ─────────────────────────────────────────────
// ✅ 2. PAYROLL GENERATION (SAFE)
// ─────────────────────────────────────────────
cron.schedule('0 2 28 * *', async () => {
    logger.info({ event: 'CRON_PAYROLL_START' });

    try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const result = await autoGeneratePayroll({ month, year });

        const admins = await User.findAll({
            include: [{
                association: 'role',
                where: { name: 'Admin' },
                required: true
            }],
            attributes: ['id', 'email', 'firstName', 'lastName'],
        });

        const tmpl = templates.payrollGenerated({
            month,
            year,
            totalEmployees: result.generated,
            totalAmount: result.totalAmount,
        });

        for (const admin of admins) {
            await notify({
                userId: admin.id,
                email: admin.email,
                subject: tmpl.subject,
                html: tmpl.html,
                socketPayload: {
                    type: 'PAYROLL_AUTO_GENERATED',
                    title: 'Payroll Generated',
                    message: `Payroll for ${month}/${year}`,
                    ...result,
                },
            });
        }

        logger.info({ event: 'CRON_PAYROLL_DONE', ...result });

    } catch (err) {
        logger.error({
            event: 'CRON_PAYROLL_ERROR',
            error: err.message,
        });
    }

}, { timezone: 'Asia/Kolkata' });


// ─────────────────────────────────────────────
// ✅ 3. YEAR END RESET
// ─────────────────────────────────────────────
cron.schedule('0 0 1 1 *', async () => {
    logger.info({ event: 'CRON_YEAR_END_RESET_START' });

    try {
        const lastYear = new Date().getFullYear() - 1;
        const result = await yearEndReset(lastYear);

        logger.info({ event: 'CRON_YEAR_END_RESET_DONE', ...result });

    } catch (err) {
        logger.error({
            event: 'CRON_YEAR_END_RESET_ERROR',
            error: err.message,
        });
    }

}, { timezone: 'Asia/Kolkata' });


// ─────────────────────────────────────────────
// ✅ 4. LEAVE PROVISION
// ─────────────────────────────────────────────
cron.schedule('0 1 2 1 *', async () => {
    logger.info({ event: 'CRON_LEAVE_PROVISION_START' });

    try {
        const result = await provisionAllEmployees();

        logger.info({ event: 'CRON_LEAVE_PROVISION_DONE', ...result });

    } catch (err) {
        logger.error({
            event: 'CRON_LEAVE_PROVISION_ERROR',
            error: err.message,
        });
    }

}, { timezone: 'Asia/Kolkata' });


// ─────────────────────────────────────────────
// ✅ 5. SHIFT AUTO ASSIGN
// ─────────────────────────────────────────────
cron.schedule('0 1 * * 0', async () => {
    logger.info({ event: 'CRON_SHIFT_ASSIGN_START' });

    try {
        const result = await assignMissingShifts();

        logger.info({ event: 'CRON_SHIFT_ASSIGN_DONE', ...result });

    } catch (err) {
        logger.error({
            event: 'CRON_SHIFT_ASSIGN_ERROR',
            error: err.message,
        });
    }

}, { timezone: 'Asia/Kolkata' });


// ─────────────────────────────────────────────
logger.info({
    event: 'CRON_JOBS_REGISTERED',
    jobs: [
        'ABSENT_MARKING',
        'PAYROLL',
        'YEAR_RESET',
        'LEAVE_PROVISION',
        'SHIFT_ASSIGN',
    ],
});