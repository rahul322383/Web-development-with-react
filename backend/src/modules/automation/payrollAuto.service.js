'use strict';

const { Payroll, Attendance, LeaveRequest, User } = require('../../database/initModels');
const { Op } = require('sequelize');
const sequelize = require('../../database/sequelize');
const { notify, templates } = require('./notification.service');
const logger = require('../../config/logger');

const WORKING_DAYS_PER_MONTH = 26;

/**
 * Calculate net salary for one employee for a given month/year.
 *
 * Formula:
 *   perDaySalary = baseSalary / WORKING_DAYS_PER_MONTH
 *   presentDays  = days with status in (present, late, half_day, on_leave)
 *   half_day     = 0.5 day
 *   on_leave     = full day (approved leave)
 *   absent       = deduction
 *   overtime     = overtimeMinutes / 60 * (perDaySalary / 8)  hourly rate
 *   lateDeduction= if late > 3 times → 0.5 day deduction per extra late
 */
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
                effectiveDays += 1; // paid leave
                break;
            case 'absent':
            default:
                break; // deduction by not counting
        }

        if (rec.overtimeMinutes > 0) {
            overtimePay += (rec.overtimeMinutes / 60) * perHour;
        }
    }

    // Late deduction: first 3 lates are free, after that 0.5 day each
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

/**
 * Auto-generate payroll for ALL active employees for a given month/year.
 * Skips employees who already have a Processed/Locked payroll for that period.
 * Creates Draft records — HR must review and lock.
 */
const autoGeneratePayroll = async ({ month, year, actorId = null }) => {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const endDate = new Date(year, month, 0).toISOString().slice(0, 10); // last day

    const employees = await User.findAll({ where: { isActive: true } });

    let generated = 0;
    let skipped = 0;
    let totalAmount = 0;
    const errors = [];

    for (const emp of employees) {
        try {
            // Skip if payroll already exists and isn't a Draft
            const existing = await Payroll.findOne({
                where: { employeeId: emp.id, month, year },
            });

            if (existing && existing.status !== 'Draft') {
                skipped++;
                continue;
            }

            // Pull attendance for the month
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

            // Notify employee their payslip draft is ready
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
            logger.error({ event: 'PAYROLL_AUTO_ERROR', employeeId: emp.id, error: err.message });
        }
    }

    logger.info({ event: 'PAYROLL_AUTO_GENERATED', month, year, generated, skipped, totalAmount });

    return { success: true, generated, skipped, totalAmount, errors };
};

module.exports = { autoGeneratePayroll, calculateNetSalary };