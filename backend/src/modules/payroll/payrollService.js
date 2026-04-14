// const sequelize = require('../../database/sequelize');
// const AppError = require('../../utils/AppError');
// const payrollRepository = require('./payrollRepository');
// const { payrollQueue } = require('../../redis/queues');
// const { logAuditEvent } = require('../../utils/auditLogger');
// const { clearCacheKeys } = require('../../utils/cache');

// const computeNetSalary = ({ baseSalary, bonus = 0, deductions = 0 }) =>
//   Number(baseSalary) + Number(bonus) - Number(deductions);

// const enqueuePayrollProcessing = async ({ month, year, actorId, ipAddress }) => {
//   const job = await payrollQueue.add('payroll-processing', { month, year, actorId, ipAddress });
//   return {
//     queued: true,
//     jobId: job.id,
//     month,
//     year
//   };
// };

// const processPayrollBatch = async ({ month, year, actorId = null, ipAddress = null }) =>
//   sequelize.transaction(async (transaction) => {
//     const employees = await payrollRepository.listActiveEmployees();
//     const results = [];

//     for (const employee of employees) {
//       const baseSalary = Number(employee.baseSalary || 0);
//       const bonus = 0;
//       const deductions = 0;
//       const netSalary = computeNetSalary({ baseSalary, bonus, deductions });

//       const payroll = await payrollRepository.upsertPayroll(
//         {
//           employeeId: employee.id,
//           month,
//           year,
//           netSalary,
//           status: 'Processed',
//           processedAt: new Date()
//         },
//         transaction
//       );

//       await payrollRepository.upsertPayrollItems(
//         {
//           payrollId: payroll.id,
//           baseSalary,
//           bonus,
//           deductions
//         },
//         transaction
//       );

//       await clearCacheKeys([`dashboard_summary:${employee.id}:${year}`]);

//       if (actorId) {
//         await logAuditEvent({
//           userId: actorId,
//           moduleName: 'Payroll',
//           actionType: 'CREATE',
//           oldData: null,
//           newData: { employeeId: employee.id, month, year, netSalary },
//           ipAddress
//         });
//       }

//       results.push({ employeeId: employee.id, payrollId: payroll.id, netSalary });
//     }

//     return {
//       month,
//       year,
//       processedCount: results.length,
//       results
//     };
//   });

// const lockPayroll = async ({ payrollId, actorId, ipAddress }) =>
//   sequelize.transaction(async (transaction) => {
//     const payroll = await payrollRepository.findPayrollById(payrollId);
//     if (!payroll) {
//       throw new AppError('Payroll not found', 404);
//     }

//     if (payroll.status === 'Locked') {
//       throw new AppError('Payroll already locked', 400);
//     }

//     await payroll.update({ status: 'Locked' }, { transaction });

//     await logAuditEvent({
//       userId: actorId,
//       moduleName: 'Payroll',
//       actionType: 'UPDATE',
//       oldData: { status: payroll.status },
//       newData: { status: 'Locked' },
//       ipAddress
//     });

//     return payroll;
//   });

// const getPayrollHistory = async (employeeId) => payrollRepository.listPayrollHistory(employeeId);

// const getPayrollByEmployee = async (employeeId) => payrollRepository.getPayrollByEmployee(employeeId);

// module.exports = {
//   getPayrollByEmployee,
//   computeNetSalary,
//   enqueuePayrollProcessing,
//   processPayrollBatch,
//   lockPayroll,
//   getPayrollHistory
// };

const sequelize = require('../../database/sequelize');
const AppError = require('../../utils/AppError');
const payrollRepository = require('./payrollRepository');
const { payrollQueue } = require('../../redis/queues');
const { logAuditEvent } = require('../../utils/auditLogger');
const { clearCacheKeys } = require('../../utils/cache');
const { sendNotification } = require('../../config/socket');

const computeNetSalary = ({ baseSalary, bonus = 0, deductions = 0 }) =>
  Number(baseSalary) + Number(bonus) - Number(deductions);

const enqueuePayrollProcessing = async ({ month, year, actorId, ipAddress }) => {
  const job = await payrollQueue.add('payroll-processing', { month, year, actorId, ipAddress });
  
  sendNotification(actorId, {
    type: "PAYROLL_QUEUED",
    title: "Payroll Processing Queued",
    message: `Payroll processing for ${month}/${year} has been queued successfully.`,
    jobId: job.id,
    month,
    year
  });
  
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

      results.push({ employeeId: employee.id, payrollId: payroll.id, netSalary });
    }

    if (actorId) {
      sendNotification(actorId, {
        type: "PAYROLL_BATCH_COMPLETED",
        title: "Payroll Processing Completed",
        message: `Payroll processing for ${month}/${year} completed successfully. Processed ${results.length} employees.`,
        month,
        year,
        processedCount: results.length,
        totalAmount: results.reduce((sum, r) => sum + r.netSalary, 0)
      });
    }

    const adminIds = await payrollRepository.getAdminIds();
    adminIds.forEach(adminId => {
      if (adminId !== actorId) {
        sendNotification(adminId, {
          type: "PAYROLL_BATCH_COMPLETED_ADMIN",
          title: "Payroll Processing Completed",
          message: `Payroll for ${month}/${year} has been processed. ${results.length} employees processed.`,
          month,
          year,
          processedCount: results.length,
          totalAmount: results.reduce((sum, r) => sum + r.netSalary, 0)
        });
      }
    });

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

    sendNotification(payroll.employeeId, {
      type: "PAYROLL_LOCKED",
      title: "Payroll Locked",
      message: `Your payroll for ${payroll.month}/${payroll.year} has been locked and finalized.`,
      payrollId: payroll.id,
      month: payroll.month,
      year: payroll.year,
      netSalary: payroll.netSalary
    });

    if (actorId && actorId !== payroll.employeeId) {
      sendNotification(actorId, {
        type: "PAYROLL_LOCKED_ADMIN",
        title: "Payroll Locked Successfully",
        message: `Payroll #${payrollId} for Employee #${payroll.employeeId} has been locked.`,
        payrollId: payroll.id,
        employeeId: payroll.employeeId,
        month: payroll.month,
        year: payroll.year
      });
    }

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