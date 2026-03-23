const sequelize = require('../../database/sequelize');              
const yearEndRepository = require('./yearEndRepository');           
const { clearCacheKeys } = require('../../utils/cache');   


const generateYearSummary = async (year) =>
  sequelize.transaction(async (transaction) => {
    const employees = await yearEndRepository.listActiveEmployees();
    const summaries = [];

    for (const employee of employees) {
      const [totalSalaryPaid, totalLeavesTaken, totalExpensesClaimed] = await Promise.all([
        yearEndRepository.getSalaryTotal(employee.id, year),
        yearEndRepository.getApprovedLeavesCount(employee.id, year),
        yearEndRepository.getExpenseTotal(employee.id, year)
      ]);

      const summary = await yearEndRepository.upsertYearSummary(
        {
          employeeId: employee.id,
          year,
          totalSalaryPaid,
          totalLeavesTaken,
          totalExpensesClaimed,
          isFinalized: true
        },
        transaction
      );

      await clearCacheKeys([`dashboard_summary:${employee.id}:${year}`]);
      summaries.push(summary);
    }

    return summaries;
  });

const getYearSummaries = async (year) => yearEndRepository.listYearSummaries(year);

module.exports = {
  generateYearSummary,
  getYearSummaries
};