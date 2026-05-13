'use strict';

const { Payroll, Attendance, LeaveRequest, User } = require('../../database/initModels');
const { Op } = require('sequelize');
const sequelize = require('../../database/sequelize');
const { notify, templates } = require('./notification.service');

const WORKING_DAYS_PER_MONTH = 26;

const calculateNetSalary = ({ baseSalary, attendanceRecords }) => {
    const perDay = Number(baseSalary) / WORKING_DAYS_PER_MONTH;
    const perHour = perDay / 8;

    let effectiveDays = 0;
    let overtimePay = 0;
    let lateCount = 0;

    for (const rec of attendanceRecords) {
        switch (rec.status) {
            case 'present':
                effectiveDays += 1;
                break;
            case 'late':
                effectiveDays += 1;
                lateCount++;
                break;
            case 'half_day':
                effectiveDays += 0.5;
                break;
            case 'on_leave':
                effectiveDays += 1;
                break;
            case 'absent':
            default:
                break;
        }

        if (rec.overtimeMinutes > 0) {
            overtimePay += (rec.overtimeMinutes / 60) * perHour;
        }
    }

    const latePenaltyDays = Math.max(0, lateCount - 3) * 0.5;
    effectiveDays -= latePenaltyDays;

    const earnedSalary = effectiveDays * perDay;
    const netSalary = Math.max(0, earnedSalary + overtimePay);

    return {
        netSalary: +netSalary.toFixed(2),
        effectiveDays: +effectiveDays.toFixed(1),
        overtimePay: +overtimePay.toFixed(2),
        lateCount,
        latePenaltyDays,
    };
};

const autoGeneratePayroll = async ({ month, year, actorId = null }) => {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().slice(0, 10);

    const employees = await User.findAll({ where: { isActive: true } });

    let generated = 0;
    let skipped = 0;
    let totalAmount = 0;
    const errors = [];

    for (const emp of employees) {
        try {
            const existing = await Payroll.findOne({
                where: { employeeId: emp.id, month, year },
            });

            if (existing && existing.status !== 'Draft') {
                skipped++;
                continue;
            }

            const attendanceRecords = await Attendance.findAll({
                where: {
                    employeeId: emp.id,
                    date: { [Op.between]: [startDate, endDate] },
                },
                attributes: ['status', 'overtimeMinutes', 'lateMinutes'],
            });

            const { netSalary, effectiveDays, overtimePay, lateCount, latePenaltyDays } =
                calculateNetSalary({ baseSalary: emp.baseSalary ?? 0, attendanceRecords });

            if (existing) {
                await existing.update({ netSalary, status: 'Draft', processedAt: new Date() });
            } else {
                await Payroll.create({
                    employeeId: emp.id,
                    month,
                    year,
                    netSalary,
                    status: 'Draft',
                    processedAt: new Date(),
                });
            }

            totalAmount += netSalary;
            generated++;

            const name = `${emp.firstName} ${emp.lastName}`;
            const tmpl = templates.salarySlip({ name, month, year, netSalary });

            await notify({
                userId: emp.id,
                email: emp.email,
                subject: tmpl.subject,
                html: tmpl.html,
                socketPayload: {
                    type: 'PAYROLL_GENERATED',
                    title: 'Salary Slip Ready',
                    message: `Your salary for ${month}/${year} has been calculated. Net: ₹${netSalary.toLocaleString('en-IN')}`,
                    month,
                    year,
                    netSalary,
                },
            });
        } catch (err) {
            errors.push({ employeeId: emp.id, error: err.message });
        }
    }

    return { success: true, generated, skipped, totalAmount, errors };
};

module.exports = { autoGeneratePayroll, calculateNetSalary };