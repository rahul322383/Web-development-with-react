const sequelize = require('../../database/sequelize');
const yearEndRepository = require('./yearEndRepository');
const { clearCacheKeys } = require('../../utils/cache');
const pLimit = require('p-limit');

const processEmployee = async (employee, year, transaction) => {
  try {
    const [totalSalaryPaid, totalLeavesTaken, totalExpensesClaimed] = await Promise.all([
      yearEndRepository.getSalaryTotal(employee.id, year, transaction),
      yearEndRepository.getApprovedLeavesCount(employee.id, year, transaction),
      yearEndRepository.getExpenseTotal(employee.id, year, transaction)
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

    return { summary, cacheKey: `dashboard_summary:${employee.id}:${year}` };
  } catch (err) {
    throw new Error(`Year summary failed for employee ${employee.id}`, { cause: err });
  }
};

const generateYearSummary = async (year) => {
  const cacheKeys = [];
  const limit = pLimit(10);

  const summaries = await sequelize.transaction(async (transaction) => {
    const employees = await yearEndRepository.listActiveEmployees({ transaction });

    const results = await Promise.all(
      employees.map((employee) =>
        limit(() => processEmployee(employee, year, transaction))
      )
    );

    results.forEach(({ cacheKey }) => cacheKeys.push(cacheKey));

    return results.map(({ summary }) => summary);
  });

  await clearCacheKeys(cacheKeys);

  return summaries;
};

const getYearSummaries = async (year) => yearEndRepository.listYearSummaries(year);

module.exports = {
  generateYearSummary,
  getYearSummaries
};