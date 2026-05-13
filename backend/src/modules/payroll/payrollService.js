
'use strict';

const sequelize = require('../../database/sequelize');
const payrollRepository = require('./payrollRepository');
const { computeSalaryBreakdown, computeNetSalary } = require('./payrollCalculator');
const { generatePayslipPDF } = require('./payslipGenerator');
const { logAuditEvent } = require('../../utils/auditLogger');
const { clearCacheKeys } = require('../../utils/cache');
const { sendNotification } = require('../../config/socket');
const logger = require('../../config/logger');
const eventBus = require('../../utils/Eventbus');
const { assertPermission } = require('../../utils/permissions');

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const fail = (message, statusCode = 400, data = null) => ({
  success: false,
  message,
  statusCode,
  data,
});

const checkPermission = (actor, permission) => {
  const result = assertPermission(actor, permission);

  const granted =
    result?.allowed === true ||
    result?.success === true;

  if (!granted) {
    return fail(result?.message || 'Forbidden', result?.statusCode || 403);
  }

  return null;
};

const processPayroll = async ({
  month,
  year,
  actorId = null,
  ipAddress = null,
  actor,
}) => {
  const denied = checkPermission(actor, 'GENERATE_PAYROLL');
  if (denied) return denied;

  try {
    const employees = await payrollRepository.listActiveEmployees();

    if (!employees.length) {
      return fail('No active employees found', 404);
    }

    const results = [];
    let totalAmount = 0;

    await sequelize.transaction(async (transaction) => {

      for (const employee of employees) {

        const monthlySalary = Number(employee.baseSalary || 0);

        // ✅ GET EMPLOYEE OVERTIME
        const overtimeMinutes =
          await payrollRepository.getEmployeeMonthlyOvertime(
            employee.id,
            month,
            year
          );

        // ✅ GET BONUS IF ANY
        const bonus = 0;

        // ✅ FIXED PAYROLL CALCULATION
        const breakdown = computeSalaryBreakdown({
          ctc: monthlySalary * 12,
          bonus,
          otMinutes: overtimeMinutes,
          isMetro: true,
        });

        // ✅ SAVE PAYROLL
        const payroll = await payrollRepository.upsertPayroll(
          {
            employeeId: employee.id,
            month,
            year,
            netSalary: breakdown.netSalary,
            status: 'Processed',
            processedAt: new Date(),
          },
          transaction
        );

        // ✅ SAVE PAYROLL ITEMS
        await payrollRepository.upsertPayrollItems(
          {
            payrollId: payroll.id,

            baseSalary: breakdown.basic,
            bonus: breakdown.bonus,

            hra: breakdown.hra,
            specialAllowance: breakdown.specialAllowance,
            overtimePay: breakdown.overtimePay,
            grossEarnings: breakdown.grossEarnings,

            pfEmployee: breakdown.pfEmployee,
            pfEmployer: breakdown.pfEmployer,
            professionalTax: breakdown.professionalTax,
            tds: breakdown.tds,

            deductions: breakdown.totalDeductions,
            totalDeductions: breakdown.totalDeductions,

            ctcMonthly: breakdown.ctcMonthly,
            ctcAnnual: breakdown.ctcAnnual,
          },
          transaction
        );

        results.push({
          employeeId: employee.id,
          payrollId: payroll.id,
          netSalary: breakdown.netSalary,
          overtimeMinutes,
          overtimePay: breakdown.overtimePay,
        });

        totalAmount += Number(breakdown.netSalary);
      }
    });

    return {
      success: true,
      statusCode: 200,
      message: 'Payroll processed successfully',
      month,
      year,
      processedCount: results.length,
      totalAmount,
      results,
    };

  } catch (error) {

    logger.error({
      event: 'PROCESS_PAYROLL_FAILED',
      month,
      year,
      error: error.message,
    });

    return fail(error.message || 'Failed to process payroll', 500);
  }
};


// ─────────────────────────────────────────────────────────────
// LOCK PAYROLL
// ─────────────────────────────────────────────────────────────

const lockPayroll = async ({ payrollId, actorId, ipAddress, actor }) => {
  const denied = checkPermission(actor, 'APPROVE_PAYROLL');
  if (denied) return denied;

  try {
    const payroll = await payrollRepository.findPayrollById(payrollId);
    if (!payroll) return fail('Payroll not found', 404);
    if (payroll.status === 'Locked') return fail('Already locked', 409);

    const oldStatus = payroll.status;

    await sequelize.transaction(async (transaction) => {
      await payrollRepository.updatePayroll(
        payrollId,
        { status: 'Locked' },
        transaction
      );
    });

    const updated = await payrollRepository.findPayrollById(payrollId);

    try {
      await logAuditEvent({
        userId: actorId,
        moduleName: 'Payroll',
        actionType: 'LOCK',
        oldData: { status: oldStatus },
        newData: { status: 'Locked' },
        ipAddress,
      });
    } catch (err) {
      logger.error({ event: 'AUDIT_LOG_FAILED', error: err.message });
    }

    sendNotification(updated.employeeId, {
      type: 'PAYROLL_LOCKED',
      title: 'Payroll Locked',
      message: `Payroll for ${updated.month}/${updated.year} finalized.`,
      payrollId: updated.id,
      month: updated.month,
      year: updated.year,
      netSalary: updated.netSalary,
    });

    eventBus.emit('PAYROLL_LOCKED', {
      payroll: updated,
      actorId,
    });

    return {
      success: true,
      statusCode: 200,
      message: 'Payroll locked successfully',
      data: updated,
    };
  } catch (error) {
    logger.error({
      event: 'LOCK_PAYROLL_FAILED',
      payrollId,
      error: error.message,
    });

    return fail(error.message || 'Failed to lock payroll', 500);
  }
};

// ─────────────────────────────────────────────────────────────
// SALARY BREAKDOWN
// ─────────────────────────────────────────────────────────────

const getSalaryBreakdown = async (payrollId, actor) => {
  const denied = checkPermission(actor, 'VIEW_PAYROLL');
  if (denied) return denied;

  try {
    const payroll =
      await payrollRepository.findPayrollWithEmployee(payrollId);

    if (!payroll) return fail('Payroll not found', 404);

    if (
      actor.role === 'Employee' &&
      Number(payroll.employeeId) !== Number(actor.employeeId)
    ) {
      return fail('Forbidden', 403);
    }

    return { success: true, statusCode: 200, data: payroll };
  } catch (error) {
    logger.error({
      event: 'GET_SALARY_BREAKDOWN_FAILED',
      payrollId,
      error: error.message,
    });

    return fail(error.message || 'Failed to fetch salary breakdown', 500);
  }
};

// ─────────────────────────────────────────────────────────────
// YTD SUMMARY
// ─────────────────────────────────────────────────────────────

const getYTDSummary = async ({ employeeId, year, actor }) => {
  const denied = checkPermission(actor, 'VIEW_PAYROLL');
  if (denied) return denied;

  if (
    actor.role === 'Employee' &&
    Number(employeeId) !== Number(actor.employeeId)
  ) {
    return fail('Forbidden', 403);
  }

  try {
    const data = await payrollRepository.getYTDSummary(employeeId, year);
    return { success: true, statusCode: 200, data };
  } catch (error) {
    logger.error({
      event: 'GET_YTD_SUMMARY_FAILED',
      error: error.message,
    });

    return fail(error.message || 'Failed to fetch YTD summary', 500);
  }
};

// ─────────────────────────────────────────────────────────────
// MONTHLY SUMMARY
// ─────────────────────────────────────────────────────────────

const getMonthlyPayrollSummary = async ({ month, year, actor }) => {
  const denied = checkPermission(actor, 'VIEW_PAYROLL');
  if (denied) return denied;

  try {
    const records =
      await payrollRepository.getMonthlyPayrollSummary({ month, year });

    const totals = records.reduce(
      (acc, p) => {
        acc.totalGross += Number(p.items?.grossEarnings || 0);
        acc.totalNet += Number(p.netSalary || 0);
        acc.totalTDS += Number(p.items?.tds || 0);
        acc.totalPF += Number(p.items?.pfEmployee || 0);
        return acc;
      },
      { totalGross: 0, totalNet: 0, totalTDS: 0, totalPF: 0 }
    );

    return {
      success: true,
      statusCode: 200,
      data: { month, year, count: records.length, totals, records },
    };
  } catch (error) {
    logger.error({
      event: 'GET_MONTHLY_SUMMARY_FAILED',
      error: error.message,
    });

    return fail(error.message || 'Failed to fetch monthly summary', 500);
  }
};

// ─────────────────────────────────────────────────────────────
// PAYSLIP DOWNLOAD
// ─────────────────────────────────────────────────────────────

const downloadPayslip = async (payrollId, actor) => {
  const denied = checkPermission(actor, 'VIEW_PAYROLL');
  if (denied) return denied;

  try {
    const payroll =
      await payrollRepository.findPayrollWithEmployee(payrollId);

    if (!payroll) return fail('Payroll not found', 404);

    if (
      actor.role === 'Employee' &&
      Number(payroll.employeeId) !== Number(actor.employeeId)
    ) {
      return fail('Forbidden', 403);
    }

    const emp = payroll.employee || {};
    const items = payroll.items || {};

    const payslipData = {
      employeeName: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
      employeeCode: emp.employeeCode,
      designation: emp.designation || '',
      department: emp.department || '',
      email: emp.email || '',
      joiningDate: emp.createdAt
        ? new Date(emp.createdAt).toLocaleDateString('en-IN')
        : '',

      month: payroll.month,
      year: payroll.year,
      status: payroll.status,

      basic: Number(items.baseSalary || 0),
      hra: Number(items.hra || 0),
      specialAllowance: Number(items.specialAllowance || 0),
      bonus: Number(items.bonus || 0),
      overtimePay: Number(items.overtimePay || 0),
      grossEarnings: Number(items.grossEarnings || 0),

      pfEmployee: Number(items.pfEmployee || 0),
      pfEmployer: Number(items.pfEmployer || 0),
      professionalTax: Number(items.professionalTax || 0),
      tds: Number(items.tds || 0),
      totalDeductions: Number(items.totalDeductions || 0),

      netSalary: Number(payroll.netSalary || 0),
      ctcMonthly: Number(items.ctcMonthly || 0),
      ctcAnnual: Number(items.ctcAnnual || 0),
    };

    const pdfBuffer = await generatePayslipPDF(payslipData);

    return {
      success: true,
      statusCode: 200,
      pdfBuffer,
      payslipData,
    };
  } catch (error) {
    logger.error({
      event: 'DOWNLOAD_PAYSLIP_FAILED',
      error: error.message,
    });

    return fail(error.message || 'Failed to generate payslip', 500);
  }
};

// ─────────────────────────────────────────────────────────────
// HISTORY
// ─────────────────────────────────────────────────────────────

const getPayrollHistory = async (employeeId, actor) => {
  const denied = checkPermission(actor, 'VIEW_PAYROLL');
  if (denied) return denied;

  try {
    const data =
      await payrollRepository.listPayrollHistory(employeeId);

    return { success: true, statusCode: 200, data };
  } catch (error) {
    logger.error({
      event: 'GET_PAYROLL_HISTORY_FAILED',
      employeeId,
      error: error.message,
    });

    return fail(error.message || 'Failed to fetch payroll history', 500);
  }
};

const getPayrollByEmployee = async (employeeId, actor) => {
  const denied = checkPermission(actor, 'VIEW_PAYROLL');
  if (denied) return denied;

  try {
    const data =
      await payrollRepository.getPayrollByEmployee(employeeId);

    return { success: true, statusCode: 200, data };
  } catch (error) {
    logger.error({
      event: 'GET_PAYROLL_BY_EMPLOYEE_FAILED',
      employeeId,
      error: error.message,
    });

    return fail(error.message || 'Failed to fetch payroll', 500);
  }
};

// ─────────────────────────────────────────────────────────────

module.exports = {
  computeNetSalary,
  processPayroll,
  lockPayroll,
  getSalaryBreakdown,
  getPayrollByEmployee,
  getPayrollHistory,
  getYTDSummary,
  getMonthlyPayrollSummary,
  downloadPayslip,
};