'use strict';

const cron = require('node-cron');
const { Attendance, User } = require('../../database/initModels');
const { Op } = require('sequelize');
const { notify, templates } = require('./notification.service');
const { autoGeneratePayroll } = require('./payrollAuto.service');
const { yearEndReset, provisionAllEmployees } = require('./leaveBalance.service');
const { assignMissingShifts } = require('./shiftAssignment.service');

const todayDate = () => new Date().toISOString().slice(0, 10);

cron.schedule('55 23 * * 1-5', async () => {
    try {
        const date = todayDate();

        const employees = await User.findAll({
            where: { isActive: true },
            attributes: ['id', 'email', 'firstName', 'lastName', 'companyId'],
        });

        if (!employees.length) return;

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
                    companyId: emp.companyId,
                    date,
                    status: 'absent',
                    checkInIp: null,
                });

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

        if (absentRecords.length) {
            await Attendance.bulkCreate(absentRecords, {
                updateOnDuplicate: ['status', 'checkInIp'],
            });
        }

    } catch (err) {
        // silent
    }

}, { timezone: 'Asia/Kolkata' });

cron.schedule('0 2 28 * *', async () => {
    try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        const result = await autoGeneratePayroll({ month, year });

        const admins = await User.findAll({
            include: [{
                association: 'role',
                where: { name: 'Admin' },
                required: true,
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

    } catch (err) {
        // silent
    }

}, { timezone: 'Asia/Kolkata' });

cron.schedule('0 0 1 1 *', async () => {
    try {
        const lastYear = new Date().getFullYear() - 1;
        await yearEndReset(lastYear);
    } catch (err) {
        // silent
    }

}, { timezone: 'Asia/Kolkata' });

cron.schedule('0 1 2 1 *', async () => {
    try {
        await provisionAllEmployees();
    } catch (err) {
        // silent
    }

}, { timezone: 'Asia/Kolkata' });

cron.schedule('0 1 * * 0', async () => {
    try {
        await assignMissingShifts();
    } catch (err) {
        // silent
    }

}, { timezone: 'Asia/Kolkata' });