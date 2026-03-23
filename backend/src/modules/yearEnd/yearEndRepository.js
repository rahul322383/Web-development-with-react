const { fn, col } = require('sequelize');
const {
  User,
  Payroll,
  LeaveRequest,
  Expense,
  YearEndSummary
} = require('../../database/initModels');

const listActiveEmployees = async () => User.findAll({ where: { isActive: true }, attributes: ['id'] });

const getSalaryTotal = async (employeeId, year) => {
  const row = await Payroll.findOne({
    where: { employeeId, year, status: ['Processed', 'Locked'] },
    attributes: [[fn('COALESCE', fn('SUM', col('net_salary')), 0), 'total']]
  });
  return Number(row?.get('total') || 0);
};

const getApprovedLeavesCount = async (employeeId, year) =>
  LeaveRequest.count({
    where: {
      employeeId,
      status: 'Approved',
      startDate: {
        [require('sequelize').Op.gte]: `${year}-01-01`
      },
      endDate: {
        [require('sequelize').Op.lte]: `${year}-12-31`
      }
    }
  });

const getExpenseTotal = async (employeeId, year) => {
  const row = await Expense.findOne({
    where: {
      employeeId,
      financeApprovalStatus: 'Approved',
      createdAt: {
        [require('sequelize').Op.gte]: `${year}-01-01`,
        [require('sequelize').Op.lte]: `${year}-12-31`
      }
    },
    attributes: [[fn('COALESCE', fn('SUM', col('amount')), 0), 'total']]
  });

  return Number(row?.get('total') || 0);
};

const upsertYearSummary = async (payload, transaction) => {
  const [summary] = await YearEndSummary.findOrCreate({
    where: { employeeId: payload.employeeId, year: payload.year },
    defaults: payload,
    transaction
  });

  if (!summary.isFinalized) {
    await summary.update(payload, { transaction });
  }

  return summary;
};

const listYearSummaries = async (year) =>
  YearEndSummary.findAll({
    where: { year },
    include: [{ model: User, as: 'employee', attributes: ['id', 'firstName', 'lastName', 'email'] }],
    order: [['employeeId', 'ASC']]
  });

module.exports = {
  listActiveEmployees,
  getSalaryTotal,
  getApprovedLeavesCount,
  getExpenseTotal,
  upsertYearSummary,
  listYearSummaries
};