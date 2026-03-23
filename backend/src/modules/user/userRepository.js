const { Op, fn, col } = require('sequelize');

const {
  User,
  Role,
  UserRole,
  LeaveRequest,
  Expense,
  Payroll,
  YearEndSummary
} = require('../../database/initModels');

const findUsers = async ({ limit, offset, search }) => {
  const where = search
    ? {
        [Op.or]: [
          { firstName: { [Op.like]: `%${search}%` } },
          { lastName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } }
        ]
      }
    : {};

  return User.findAndCountAll({
    where,
    attributes: { exclude: ['passwordHash'] },
    include: [{ model: Role, attributes: ['name'] }],
    limit,
    offset,
    order: [['createdAt', 'DESC']]
  });
};

const findUserById = async (id) =>
  User.findByPk(id, {
    attributes: { exclude: ['passwordHash'] },
    include: [{ model: Role, attributes: ['name'] }]
  });

const createUser = async (payload, transaction) => User.create(payload, { transaction });

const updateUserById = async (id, payload) => User.update(payload, { where: { id } });

const softDeleteUser = async (id) => User.destroy({ where: { id } });

const findOrCreateRole = async (name, transaction) =>
  Role.findOrCreate({ where: { name }, defaults: { name }, transaction });

const mapRoleToUser = async (userId, roleId, transaction) =>
  UserRole.findOrCreate({ where: { userId, roleId }, defaults: { userId, roleId }, transaction });

const countApprovedLeaves = async (employeeId) =>
  LeaveRequest.count({ where: { employeeId, status: 'Approved' } });

const sumApprovedExpenses = async (employeeId) => {
  const result = await Expense.findOne({
    where: { employeeId, financeApprovalStatus: 'Approved' },
    attributes: [[fn('COALESCE', fn('SUM', col('amount')), 0), 'total']]
  });

  return Number(result?.get('total') || 0);
};

const sumSalaryByYear = async (employeeId, year) => {
  const result = await Payroll.findOne({
    where: { employeeId, year, status: { [Op.in]: ['Processed', 'Locked'] } },
    attributes: [[fn('COALESCE', fn('SUM', col('net_salary')), 0), 'total']]
  });

  return Number(result?.get('total') || 0);
};

const findYearEndSummary = async (employeeId, year) =>
  YearEndSummary.findOne({ where: { employeeId, year } });



const findUserByEmail = async (email) => User.findOne({ where: { email } });
  findUsers,
  findUserById,
  findUserByEmail,
  createUser,

module.exports = {
  findUsers,
  findUserById,
  createUser,
  updateUserById,
  softDeleteUser,
  findOrCreateRole,
  mapRoleToUser,
  countApprovedLeaves,
  sumApprovedExpenses,
  sumSalaryByYear,
  findYearEndSummary
};