const sequelize = require('../../database/sequelize');
const AppError = require('../../utils/AppError');
const payrollRepository = require('./payrollRepository');
const { payrollQueue } = require('../../redis/queues');
const { logAuditEvent } = require('../../utils/auditLogger');
const { clearCacheKeys } = require('../../utils/cache');

const computeNetSalary = ({ baseSalary, bonus = 0, deductions = 0 }) =>
  Number(baseSalary) + Number(bonus) - Number(deductions);

const enqueuePayrollProcessing = async ({ month, year, actorId, ipAddress }) => {
  const job = await payrollQueue.add('payroll-processing', { month, year, actorId, ipAddress });
  return {
    queued: true,
    jobId: job.id,
    month,
    year
  };
};

const processPayrollBatch = async ({ month, year, actorId = null, ipAddress = null }) =>
  sequelize.transaction(async (transaction) => {
    const employees = await payrollRepository.listActiveEmployees();
    const results = [];

    for (const employee of employees) {
      const baseSalary = Number(employee.baseSalary || 0);
      const bonus = 0;
      const deductions = 0;
      const netSalary = computeNetSalary({ baseSalary, bonus, deductions });

      const payroll = await payrollRepository.upsertPayroll(
        {
          employeeId: employee.id,
          month,
          year,
          netSalary,
          status: 'Processed',
          processedAt: new Date()
        },
        transaction
      );

      await payrollRepository.upsertPayrollItems(
        {
          payrollId: payroll.id,
          baseSalary,
          bonus,
          deductions
        },
        transaction
      );

      await clearCacheKeys([`dashboard_summary:${employee.id}:${year}`]);

      if (actorId) {
        await logAuditEvent({
          userId: actorId,
          moduleName: 'Payroll',
          actionType: 'CREATE',
          oldData: null,
          newData: { employeeId: employee.id, month, year, netSalary },
          ipAddress
        });
      }

      results.push({ employeeId: employee.id, payrollId: payroll.id, netSalary });
    }

    return {
      month,
      year,
      processedCount: results.length,
      results
    };
  });

const lockPayroll = async ({ payrollId, actorId, ipAddress }) =>
  sequelize.transaction(async (transaction) => {
    const payroll = await payrollRepository.findPayrollById(payrollId);
    if (!payroll) {
      throw new AppError('Payroll not found', 404);
    }

    if (payroll.status === 'Locked') {
      throw new AppError('Payroll already locked', 400);
    }

    await payroll.update({ status: 'Locked' }, { transaction });

    await logAuditEvent({
      userId: actorId,
      moduleName: 'Payroll',
      actionType: 'UPDATE',
      oldData: { status: payroll.status },
      newData: { status: 'Locked' },
      ipAddress
    });

    return payroll;
  });

const getPayrollHistory = async (employeeId) => payrollRepository.listPayrollHistory(employeeId);

const getPayrollByEmployee = async (employeeId) => payrollRepository.getPayrollByEmployee(employeeId);

module.exports = {
  getPayrollByEmployee,
  computeNetSalary,
  enqueuePayrollProcessing,
  processPayrollBatch,
  lockPayroll,
  getPayrollHistory
};