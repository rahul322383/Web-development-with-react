const sequelize = require('../../database/sequelize');
const AppError = require('../../utils/AppError');
const payrollRepository = require('./payrollRepository');
const { logAuditEvent } = require('../../utils/auditLogger');
const { clearCacheKeys } = require('../../utils/cache');
const { sendNotification } = require('../../config/socket');

// 🔢 Safe salary calculation
const computeNetSalary = ({ baseSalary = 0, bonus = 0, deductions = 0 }) => {
  return Number(baseSalary) + Number(bonus) - Number(deductions);
};

// ⚙️ DIRECT payroll processing (no queue)
const processPayroll = async ({ month, year, actorId = null, ipAddress = null }) =>
  sequelize.transaction(async (transaction) => {

    const employees = await payrollRepository.listActiveEmployees();

    if (!employees.length) {
      throw new AppError('No active employees found', 404);
    }

    const results = [];
    let totalAmount = 0;

    for (const employee of employees) {
      const baseSalary = Number(employee.baseSalary || 0);

      // 👉 You can later fetch these dynamically
      const bonus = 0;
      const deductions = 0;

      const netSalary = computeNetSalary({ baseSalary, bonus, deductions });

      // 🧾 Create/update payroll
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

      // 📦 Payroll breakdown
      await payrollRepository.upsertPayrollItems(
        {
          payrollId: payroll.id,
          baseSalary,
          bonus,
          deductions
        },
        transaction
      );

      // 🧹 Clear cache
      await clearCacheKeys([`dashboard_summary:${employee.id}:${year}`]);

      // 📝 Audit
      if (actorId) {
        await logAuditEvent({
          userId: actorId,
          moduleName: 'Payroll',
          actionType: 'CREATE',
          oldData: null,
          newData: {
            employeeId: employee.id,
            month,
            year,
            netSalary
          },
          ipAddress
        });
      }

      // 🔔 Notify employee
      sendNotification(employee.id, {
        type: "PAYROLL_PROCESSED",
        title: "Salary Processed",
        message: `Your salary for ${month}/${year} has been processed. Net salary: $${netSalary}`,
        payrollId: payroll.id,
        month,
        year,
        netSalary,
        baseSalary,
        bonus,
        deductions
      });

      results.push({
        employeeId: employee.id,
        payrollId: payroll.id,
        netSalary
      });

      totalAmount += netSalary;
    }

    // 🔔 Notify actor (who triggered)
    if (actorId) {
      sendNotification(actorId, {
        type: "PAYROLL_COMPLETED",
        title: "Payroll Completed",
        message: `Payroll for ${month}/${year} processed successfully.`,
        month,
        year,
        processedCount: results.length,
        totalAmount
      });
    }

    // 🔔 Notify admins
    const adminIds = await payrollRepository.getAdminIds();

    adminIds.forEach((adminId) => {
      if (adminId !== actorId) {
        sendNotification(adminId, {
          type: "PAYROLL_COMPLETED_ADMIN",
          title: "Payroll Completed",
          message: `Payroll for ${month}/${year} processed.`,
          month,
          year,
          processedCount: results.length,
          totalAmount
        });
      }
    });

    return {
      success: true,
      month,
      year,
      processedCount: results.length,
      totalAmount,
      results
    };
  });

// 🔒 Lock payroll
const lockPayroll = async ({ payrollId, actorId, ipAddress }) =>
  sequelize.transaction(async (transaction) => {

    const payroll = await payrollRepository.findPayrollById(payrollId);

    if (!payroll) {
      throw new AppError('Payroll not found', 404);
    }

    if (payroll.status === 'Locked') {
      throw new AppError('Payroll already locked', 400);
    }

    const oldStatus = payroll.status;

    await payroll.update({ status: 'Locked' }, { transaction });

    // 📝 Audit log
    await logAuditEvent({
      userId: actorId,
      moduleName: 'Payroll',
      actionType: 'UPDATE',
      oldData: { status: oldStatus },
      newData: { status: 'Locked' },
      ipAddress
    });

    // 🔔 Notify employee
    sendNotification(payroll.employeeId, {
      type: "PAYROLL_LOCKED",
      title: "Payroll Locked",
      message: `Your payroll for ${payroll.month}/${payroll.year} has been finalized.`,
      payrollId: payroll.id,
      month: payroll.month,
      year: payroll.year,
      netSalary: payroll.netSalary
    });

    // 🔔 Notify admin
    if (actorId && actorId !== payroll.employeeId) {
      sendNotification(actorId, {
        type: "PAYROLL_LOCKED_ADMIN",
        title: "Payroll Locked",
        message: `Payroll #${payrollId} locked successfully.`,
        payrollId: payroll.id,
        employeeId: payroll.employeeId,
        month: payroll.month,
        year: payroll.year
      });
    }

    return payroll;
  });

// 📊 History
const getPayrollHistory = async (employeeId) =>
  payrollRepository.listPayrollHistory(employeeId);

// 📊 Employee payroll
const getPayrollByEmployee = async (employeeId) =>
  payrollRepository.getPayrollByEmployee(employeeId);

module.exports = {
  computeNetSalary,
  processPayroll,
  lockPayroll,
  getPayrollHistory,
  getPayrollByEmployee
};