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
const {
  processPayrollSchema,
  lockPayrollSchema,
  employeeIdSchema,
  validate,
} = require('./payrollValidation');

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fail = (message, statusCode = 400, data = null) => ({
  success: false, message, statusCode, data,
});

const checkPermission = (actor, permission) => {
  const perm = assertPermission(actor, permission);
  const granted = perm.success ?? perm.allowed ?? false;
  if (!granted) return fail(perm.message || 'Forbidden', perm.statusCode || 403);
  return null;
};

// ─── processPayroll (ENHANCED) ────────────────────────────────────────────────
const processPayroll = async ({ month, year, actorId = null, ipAddress = null, actor }) => {
  const denied = checkPermission(actor, 'GENERATE_PAYROLL');
  if (denied) return denied;

  const validation = validate(processPayrollSchema, { month, year, actorId });
  if (!validation.valid) return fail(validation.message);

  const { value } = validation;

  try {
    const employees = await payrollRepository.listActiveEmployees();
    if (!employees.length) return fail('No active employees found', 404);

    const adminIds = await payrollRepository.getAdminIds();
    const results = [];
    let totalAmount = 0;

    await sequelize.transaction(async (transaction) => {
      for (const employee of employees) {
        // ── Full salary breakdown per employee ──────────────────────────────
        const breakdown = computeSalaryBreakdown({
          ctc: Number(employee.baseSalary) * 12,   // baseSalary = monthly CTC
          bonus: 0,
          otMinutes: 0,
          isMetro: true,
        });

        const payroll = await payrollRepository.upsertPayroll({
          employeeId: employee.id,
          month: value.month,
          year: value.year,
          netSalary: breakdown.netSalary,
          status: 'Processed',
          processedAt: new Date(),
        }, transaction);

        await payrollRepository.upsertPayrollItems({
          payrollId: payroll.id,
          // existing fields (backward compat)
          baseSalary: breakdown.basic,
          bonus: breakdown.bonus,
          deductions: breakdown.totalDeductions,
          // new breakdown fields
          hra: breakdown.hra,
          specialAllowance: breakdown.specialAllowance,
          overtimePay: breakdown.overtimePay,
          pfEmployee: breakdown.pfEmployee,
          pfEmployer: breakdown.pfEmployer,
          professionalTax: breakdown.professionalTax,
          tds: breakdown.tds,
          grossEarnings: breakdown.grossEarnings,
          ctcMonthly: breakdown.ctcMonthly,
          ctcAnnual: breakdown.ctcAnnual,
        }, transaction);

        results.push({ employeeId: employee.id, payrollId: payroll.id, netSalary: breakdown.netSalary });
        totalAmount += breakdown.netSalary;
      }
    });

    // Cache bust
    await Promise.all(
      results.map(({ employeeId }) =>
        clearCacheKeys([`dashboard_summary:${employeeId}:${value.year}`]).catch(err =>
          logger.error({ event: 'CACHE_BUST_FAILED', employeeId, error: err.message }),
        ),
      ),
    );

    // Audit
    if (value.actorId) {
      try {
        await logAuditEvent({
          userId: value.actorId, moduleName: 'Payroll', actionType: 'BULK_PROCESS',
          oldData: null,
          newData: { month: value.month, year: value.year, processedCount: results.length, totalAmount },
          ipAddress,
        });
      } catch (auditErr) {
        logger.error({ event: 'AUDIT_LOG_FAILED', error: auditErr.message });
      }
    }

    // Notifications
    results.forEach(({ employeeId, payrollId, netSalary }) => {
      sendNotification(employeeId, {
        type: 'PAYROLL_PROCESSED', title: 'Salary Processed',
        message: `Your salary for ${value.month}/${value.year} has been processed. Net: ₹${netSalary}`,
        payrollId, month: value.month, year: value.year, netSalary,
      });
    });

    eventBus.emit('PAYROLL_PROCESSED', { month: value.month, year: value.year, results, totalAmount });

    return {
      success: true, statusCode: 200,
      message: 'Payroll processed successfully',
      month: value.month, year: value.year,
      processedCount: results.length, totalAmount, results,
    };

  } catch (error) {
    logger.error({ event: 'PROCESS_PAYROLL_FAILED', month, year, error: error.message });
    return fail(error.message || 'Failed to process payroll', 500);
  }
};

// ─── lockPayroll (unchanged logic, kept intact) ───────────────────────────────
const lockPayroll = async ({ payrollId, actorId, ipAddress, actor }) => {
  const denied = checkPermission(actor, 'APPROVE_PAYROLL');
  if (denied) return denied;

  const validation = validate(lockPayrollSchema, { payrollId, actorId });
  if (!validation.valid) return fail(validation.message);

  const { value } = validation;

  try {
    const payroll = await payrollRepository.findPayrollById(value.payrollId);
    if (!payroll) return fail('Payroll not found', 404);
    if (payroll.status === 'Locked') return fail('Payroll is already locked', 409);

    const oldStatus = payroll.status;

    await sequelize.transaction(async (transaction) => {
      await payrollRepository.updatePayroll(value.payrollId, { status: 'Locked' }, transaction);
    });

    const updated = await payrollRepository.findPayrollById(value.payrollId);

    try {
      await logAuditEvent({
        userId: value.actorId, moduleName: 'Payroll', actionType: 'LOCK',
        oldData: { status: oldStatus }, newData: { status: 'Locked' }, ipAddress,
      });
    } catch (auditErr) {
      logger.error({ event: 'AUDIT_LOG_FAILED', error: auditErr.message });
    }

    sendNotification(updated.employeeId, {
      type: 'PAYROLL_LOCKED', title: 'Payroll Locked',
      message: `Your payroll for ${updated.month}/${updated.year} has been finalized.`,
      payrollId: updated.id, month: updated.month, year: updated.year, netSalary: updated.netSalary,
    });

    eventBus.emit('PAYROLL_LOCKED', { payroll: updated, actorId: value.actorId });

    return { success: true, statusCode: 200, message: 'Payroll locked successfully', data: updated };

  } catch (error) {
    logger.error({ event: 'LOCK_PAYROLL_FAILED', payrollId, actorId, error: error.message });
    return fail(error.message || 'Failed to lock payroll', 500);
  }
};

// ─── getPayrollHistory (existing, unchanged) ──────────────────────────────────
const getPayrollHistory = async (employeeId, actor) => {
  const denied = checkPermission(actor, 'VIEW_PAYROLL');
  if (denied) return denied;

  const validation = validate(employeeIdSchema, { employeeId });
  if (!validation.valid) return fail(validation.message);

  try {
    const data = await payrollRepository.listPayrollHistory(validation.value.employeeId);
    return { success: true, statusCode: 200, data };
  } catch (error) {
    logger.error({ event: 'GET_PAYROLL_HISTORY_FAILED', employeeId, error: error.message });
    return fail(error.message || 'Failed to fetch payroll history', 500);
  }
};

const getPayrollByEmployee = async (employeeId, actor) => {
  const denied = checkPermission(actor, 'VIEW_PAYROLL');
  if (denied) return denied;

  const validation = validate(employeeIdSchema, { employeeId });
  if (!validation.valid) return fail(validation.message);

  try {
    const data = await payrollRepository.getPayrollByEmployee(validation.value.employeeId);
    return { success: true, statusCode: 200, data };
  } catch (error) {
    logger.error({ event: 'GET_PAYROLL_BY_EMPLOYEE_FAILED', employeeId, error: error.message });
    return fail(error.message || 'Failed to fetch payroll', 500);
  }
};

// ─── NEW: getSalaryBreakdown ──────────────────────────────────────────────────
/**
 * Returns the full computed salary breakdown for a payroll record.
 * Employees can view their own; HR/Admin can view any.
 */
const getSalaryBreakdown = async (payrollId, actor) => {
  const denied = checkPermission(actor, 'VIEW_PAYROLL');
  if (denied) return denied;

  try {
    const payroll = await payrollRepository.findPayrollWithEmployee(payrollId);
    if (!payroll) return fail('Payroll not found', 404);

    // Authorisation: employee can only see own payroll
    if (actor.role === 'Employee' && Number(payroll.employeeId) !== Number(actor.id)) {
      return fail('Forbidden', 403);
    }

    return { success: true, statusCode: 200, data: payroll };
  } catch (error) {
    logger.error({ event: 'GET_SALARY_BREAKDOWN_FAILED', payrollId, error: error.message });
    return fail(error.message || 'Failed to fetch salary breakdown', 500);
  }
};

// ─── NEW: getYTDSummary ───────────────────────────────────────────────────────
/**
 * Year-to-date summary — useful on the employee dashboard.
 */
const getYTDSummary = async ({ employeeId, year, actor }) => {
  const denied = checkPermission(actor, 'VIEW_PAYROLL');
  if (denied) return denied;

  if (actor.role === 'Employee' && Number(employeeId) !== Number(actor.id)) {
    return fail('Forbidden', 403);
  }

  try {
    const data = await payrollRepository.getYTDSummary(employeeId, year);
    return { success: true, statusCode: 200, data };
  } catch (error) {
    logger.error({ event: 'GET_YTD_SUMMARY_FAILED', employeeId, year, error: error.message });
    return fail(error.message || 'Failed to fetch YTD summary', 500);
  }
};

// ─── NEW: getMonthlyPayrollSummary ────────────────────────────────────────────
/**
 * HR/Admin: full team payroll for a given month/year.
 */
const getMonthlyPayrollSummary = async ({ month, year, actor }) => {
  const denied = checkPermission(actor, 'VIEW_PAYROLL');
  if (denied) return denied;

  try {
    const records = await payrollRepository.getMonthlyPayrollSummary({ month, year });

    const totals = records.reduce((acc, p) => {
      acc.totalGross += Number(p.items?.grossEarnings || 0);
      acc.totalNet += Number(p.netSalary || 0);
      acc.totalTDS += Number(p.items?.tds || 0);
      acc.totalPF += Number(p.items?.pfEmployee || 0);
      return acc;
    }, { totalGross: 0, totalNet: 0, totalTDS: 0, totalPF: 0 });

    return {
      success: true, statusCode: 200,
      data: { month, year, count: records.length, totals, records },
    };
  } catch (error) {
    logger.error({ event: 'GET_MONTHLY_SUMMARY_FAILED', month, year, error: error.message });
    return fail(error.message || 'Failed to fetch monthly summary', 500);
  }
};

// ─── NEW: downloadPayslip ─────────────────────────────────────────────────────
/**
 * Generates and returns a PDF buffer for the given payroll record.
 * Controller must stream it as application/pdf.
 */
const downloadPayslip = async (payrollId, actor) => {
  const denied = checkPermission(actor, 'VIEW_PAYROLL');
  if (denied) return denied;

  try {
    const payroll = await payrollRepository.findPayrollWithEmployee(payrollId);
    if (!payroll) return fail('Payroll not found', 404);

    if (actor.role === 'Employee' && Number(payroll.employeeId) !== Number(actor.id)) {
      return fail('Forbidden', 403);
    }

    const emp = payroll.employee || {};
    const items = payroll.items || {};

    const payslipData = {
      // Employee
      employeeName: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
      employeeCode: emp.employeeCode,
      designation: emp.designation || '',
      department: emp.department || '',
      email: emp.email || '',
      joiningDate: emp.createdAt ? new Date(emp.createdAt).toLocaleDateString('en-IN') : '',

      // Period
      month: payroll.month,
      year: payroll.year,
      status: payroll.status,

      // Earnings
      basic: Number(items.baseSalary || 0),
      hra: Number(items.hra || 0),
      specialAllowance: Number(items.specialAllowance || 0),
      bonus: Number(items.bonus || 0),
      overtimePay: Number(items.overtimePay || 0),
      grossEarnings: Number(items.grossEarnings || 0),

      // Deductions
      pfEmployee: Number(items.pfEmployee || 0),
      pfEmployer: Number(items.pfEmployer || 0),
      professionalTax: Number(items.professionalTax || 0),
      tds: Number(items.tds || 0),
      totalDeductions: Number(items.deductions || 0),

      // Net
      netSalary: Number(payroll.netSalary || 0),
      ctcMonthly: Number(items.ctcMonthly || 0),
      ctcAnnual: Number(items.ctcAnnual || 0),
    };

    const pdfBuffer = await generatePayslipPDF(payslipData);

    return { success: true, statusCode: 200, pdfBuffer, payslipData };

  } catch (error) {
    logger.error({ event: 'DOWNLOAD_PAYSLIP_FAILED', payrollId, error: error.message });
    return fail(error.message || 'Failed to generate payslip', 500);
  }
};

module.exports = {
  // existing
  computeNetSalary,
  processPayroll,
  lockPayroll,
  getPayrollHistory,
  getPayrollByEmployee,
  // new
  getSalaryBreakdown,
  getYTDSummary,
  getMonthlyPayrollSummary,
  downloadPayslip,
};