'use strict';

const sequelize = require('../../database/sequelize');
const yearEndRepository = require('./yearEndRepository');
const { clearCacheKeys } = require('../../utils/cache');
const { assertPermission } = require('../../utils/permissions');
const logger = require('../../config/logger');
const pLimit = require('p-limit');

const fail = (message, statusCode = 400, data = null) => ({
  success: false, message, statusCode, data,
});

const checkPermission = (actor, permission) => {
  const perm = assertPermission(actor, permission);
  const granted = perm.success ?? perm.allowed ?? false;
  if (!granted) return fail(perm.message || 'Forbidden', perm.statusCode || 403);
  return null;
};

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

const generateYearSummary = async ({ year, actor }) => {
  const denied = checkPermission(actor, 'GENERATE_YEAR_END_REPORT');
  if (denied) return denied;

  if (!year) return fail('year is required');

  const cacheKeys = [];
  const limit = pLimit(10);

  try {
    await sequelize.transaction(async (transaction) => {
      const employees = await yearEndRepository.listActiveEmployees(transaction);

      if (!employees.length) {
        throw new Error('No active employees found');
      }

      const results = await Promise.all(
        employees.map((employee) =>
          limit(() => processEmployee(employee, year, transaction))
        )
      );

      results.forEach(({ cacheKey }) => cacheKeys.push(cacheKey));
    });

    await clearCacheKeys(cacheKeys);

    // ✅ FETCH SUMMARIES
    const summaries = await yearEndRepository.listYearSummaries(year);

    // 🔥 ADD DETAILS (leaves + expenses)
    const enrichedSummaries = await Promise.all(
      summaries.map(async (summary) => {
        const employeeId = summary.employeeId;

        const [leaves, expenses] = await Promise.all([
          yearEndRepository.getApprovedLeaves(employeeId, year),
          yearEndRepository.getApprovedExpenses(employeeId, year),
        ]);

        return {
          ...summary.toJSON(),
          leaves,     // 👈 full leave records
          expenses,   // 👈 full expense records
        };
      })
    );

    return {
      success: true,
      statusCode: 200,
      message: 'Year end summaries generated successfully',
      count: enrichedSummaries.length,
      data: enrichedSummaries,
    };

  } catch (err) {
   

    logger.error({
      event: 'GENERATE_YEAR_SUMMARY_FAILED',
      year,
      error: err.message,
      stack: err.stack,
    });

    return fail(err.message || 'Failed to generate year summaries', 500);
  }
};

const getYearSummaries = async ({ year, actor }) => {
  const denied = checkPermission(actor, 'VIEW_YEAR_END_REPORT');
  if (denied) return denied;

  if (!year) return fail('year is required');

  try {
    const data = await yearEndRepository.listYearSummaries(year);
    return { success: true, statusCode: 200, data };
  } catch (err) {
    logger.error({ event: 'GET_YEAR_SUMMARIES_FAILED', year, error: err.message });
    return fail(err.message || 'Failed to fetch year summaries', 500);
  }
};

module.exports = {
  generateYearSummary,
  getYearSummaries,
};