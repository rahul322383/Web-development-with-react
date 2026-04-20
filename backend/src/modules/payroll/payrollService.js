'use strict';

const sequelize = require('../../database/sequelize');
const payrollRepository = require('./payrollRepository');
const { logAuditEvent } = require('../../utils/auditLogger');
const { clearCacheKeys } = require('../../utils/cache');
const { sendNotification } = require('../../config/socket');
const logger = require('../../config/logger');
const eventBus = require('../../utils/Eventbus');        // FIX: removed trailing space
const { assertPermission } = require('../../utils/permissions');
const {
  processPayrollSchema,
  lockPayrollSchema,
  employeeIdSchema,
  validate,
} = require('./payrollValidation');

const fail = (message, statusCode = 400, data = null) => ({
  success: false, message, statusCode, data,
});

// FIX: single consistent permission check helper
const checkPermission = (actor, permission) => {
  const perm = assertPermission(actor, permission);
  const granted = perm.success ?? perm.allowed ?? false;
  if (!granted) return fail(perm.message || 'Forbidden', perm.statusCode || 403);
  return null;
};

const computeNetSalary = ({ baseSalary = 0, bonus = 0, deductions = 0 }) =>
  Number(baseSalary) + Number(bonus) - Number(deductions);

// ---------------------------------------------------------------------------
// processPayroll
// ---------------------------------------------------------------------------

const processPayroll = async ({ month, year, actorId = null, ipAddress = null, actor }) => {
  const denied = checkPermission(actor, 'GENERATE_PAYROLL');  // FIX: correct permission name
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

    // Only DB writes inside the transaction
    await sequelize.transaction(async (transaction) => {
      for (const employee of employees) {
        const baseSalary = Number(employee.baseSalary || 0);
        const bonus = 0;
        const deductions = 0;
        const netSalary = computeNetSalary({ baseSalary, bonus, deductions });

        const payroll = await payrollRepository.upsertPayroll(
          {
            employeeId: employee.id,
            month: value.month,
            year: value.year,
            netSalary,
            status: 'Processed',
            processedAt: new Date(),
          },
          transaction,
        );

        await payrollRepository.upsertPayrollItems(
          { payrollId: payroll.id, baseSalary, bonus, deductions },
          transaction,
        );

        results.push({ employeeId: employee.id, payrollId: payroll.id, netSalary });
        totalAmount += netSalary;
      }
    });

    // Cache bust outside transaction — fire-and-forget
    await Promise.all(
      results.map(({ employeeId }) =>
        clearCacheKeys([`dashboard_summary:${employeeId}:${value.year}`]).catch((err) =>
          logger.error({ event: 'CACHE_BUST_FAILED', employeeId, error: err.message }),
        ),
      ),
    );

    // Audit outside transaction
    if (value.actorId) {
      try {
        await logAuditEvent({
          userId: value.actorId,
          moduleName: 'Payroll',
          actionType: 'BULK_PROCESS',
          oldData: null,
          newData: { month: value.month, year: value.year, processedCount: results.length, totalAmount },
          ipAddress,
        });
      } catch (auditErr) {
        logger.error({ event: 'AUDIT_LOG_FAILED', error: auditErr.message });
      }
    }

    // Notifications outside transaction
    results.forEach(({ employeeId, payrollId, netSalary }) => {
      sendNotification(employeeId, {
        type: 'PAYROLL_PROCESSED',
        title: 'Salary Processed',
        message: `Your salary for ${value.month}/${value.year} has been processed. Net: ${netSalary}`,
        payrollId,
        month: value.month,
        year: value.year,
        netSalary,
      });
    });

    if (value.actorId) {
      sendNotification(value.actorId, {
        type: 'PAYROLL_COMPLETED',
        title: 'Payroll Completed',
        message: `Payroll for ${value.month}/${value.year} processed successfully.`,
        month: value.month,
        year: value.year,
        processedCount: results.length,
        totalAmount,
      });
    }

    adminIds.forEach((adminId) => {
      if (adminId !== value.actorId) {
        sendNotification(adminId, {
          type: 'PAYROLL_COMPLETED_ADMIN',
          title: 'Payroll Completed',
          message: `Payroll for ${value.month}/${value.year} processed.`,
          month: value.month,
          year: value.year,
          processedCount: results.length,
          totalAmount,
        });
      }
    });

    eventBus.emit('PAYROLL_PROCESSED', { month: value.month, year: value.year, results, totalAmount });

    return {
      success: true,
      statusCode: 200,
      message: 'Payroll processed successfully',
      month: value.month,
      year: value.year,
      processedCount: results.length,
      totalAmount,
      results,
    };

  } catch (error) {
    logger.error({ event: 'PROCESS_PAYROLL_FAILED', month, year, error: error.message, stack: error.stack });
    return fail(error.message || 'Failed to process payroll', 500);
  }
};

// ---------------------------------------------------------------------------
// lockPayroll
// ---------------------------------------------------------------------------

const lockPayroll = async ({ payrollId, actorId, ipAddress, actor }) => {
  const denied = checkPermission(actor, 'APPROVE_PAYROLL');  // FIX: correct permission name
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
      await payrollRepository.updatePayroll(
        value.payrollId,
        { status: 'Locked' },
        transaction,
      );
    });

    const updatedPayroll = await payrollRepository.findPayrollById(value.payrollId);

    try {
      await logAuditEvent({
        userId: value.actorId,
        moduleName: 'Payroll',
        actionType: 'LOCK',
        oldData: { status: oldStatus },
        newData: { status: 'Locked' },
        ipAddress,
      });
    } catch (auditErr) {
      logger.error({ event: 'AUDIT_LOG_FAILED', error: auditErr.message });
    }

    sendNotification(updatedPayroll.employeeId, {
      type: 'PAYROLL_LOCKED',
      title: 'Payroll Locked',
      message: `Your payroll for ${updatedPayroll.month}/${updatedPayroll.year} has been finalized.`,
      payrollId: updatedPayroll.id,
      month: updatedPayroll.month,
      year: updatedPayroll.year,
      netSalary: updatedPayroll.netSalary,
    });

    if (Number(value.actorId) !== Number(updatedPayroll.employeeId)) {
      sendNotification(value.actorId, {
        type: 'PAYROLL_LOCKED_ADMIN',
        title: 'Payroll Locked',
        message: `Payroll #${value.payrollId} locked successfully.`,
        payrollId: updatedPayroll.id,
        employeeId: updatedPayroll.employeeId,
        month: updatedPayroll.month,
        year: updatedPayroll.year,
      });
    }

    eventBus.emit('PAYROLL_LOCKED', { payroll: updatedPayroll, actorId: value.actorId });

    return {
      success: true,
      statusCode: 200,
      message: 'Payroll locked successfully',
      data: updatedPayroll,
    };

  } catch (error) {
    logger.error({ event: 'LOCK_PAYROLL_FAILED', payrollId, actorId, error: error.message, stack: error.stack });
    return fail(error.message || 'Failed to lock payroll', 500);
  }
};

// ---------------------------------------------------------------------------
// Read functions
// ---------------------------------------------------------------------------

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

module.exports = {
  computeNetSalary,
  processPayroll,
  lockPayroll,
  getPayrollHistory,
  getPayrollByEmployee,
};