const sequelize = require('../database/sequelize');
const payrollService = require('../modules/payroll/service/payrollService');
const yearEndRepository = require('../modules/yearEnd/yearEndRepository');
const leaveRepository = require('../modules/leave/leaveRepository');

const runMonthlyPayroll = async () => {
  const now = new Date();
  return payrollService.processPayroll({
    month: now.getMonth() + 1,
    year: now.getFullYear()
  });
};

const runYearlyLeaveReset = async () =>
  sequelize.transaction(async (transaction) => {
    const employees = await leaveRepository.listAllEmployees();

    await Promise.all(
      employees.map((emp) =>
        leaveRepository.resetEmployeeLeaves(emp.id, transaction)
      )
    );

    return { success: true, count: employees.length };
  });

const runYearEndSummary = async () =>
  sequelize.transaction(async (transaction) => {
    const year = new Date().getFullYear() - 1;
    const employees = await yearEndRepository.listActiveEmployees();

    const summaries = await Promise.all(
      employees.map(async (employee) => {
        const [totalSalaryPaid, totalLeaves] = await Promise.all([
          yearEndRepository.getTotalSalary(employee.id, year),
          yearEndRepository.getTotalLeaves(employee.id, year)
        ]);

        return yearEndRepository.createYearSummary(
          {
            employeeId: employee.id,
            year,
            totalSalaryPaid,
            totalLeaves
          },
          transaction
        );
      })
    );

    return { success: true, year, count: summaries.length };
  });

module.exports = {
  runMonthlyPayroll,
  runYearlyLeaveReset,
  runYearEndSummary
};