const { Op } = require('sequelize');
const { LeaveRequest, LeaveBalance, User } = require('../../database/initModels');

const findEmployee = async (id) => User.findByPk(id);

const findLeaveBalance = async (employeeId, year) =>
  LeaveBalance.findOne({ where: { employeeId, year } });

const createLeaveBalance = async (payload, transaction) => LeaveBalance.create(payload, { transaction });

const updateLeaveBalance = async (employeeId, year, payload, transaction) =>
  LeaveBalance.update(payload, { where: { employeeId, year }, transaction });

const createLeaveRequest = async (payload, transaction) => LeaveRequest.create(payload, { transaction });

const findLeaveRequestById = async (id) => LeaveRequest.findByPk(id);

const updateLeaveRequest = async (id, payload, transaction) =>
  LeaveRequest.update(payload, { where: { id }, transaction });

const listEmployeeLeavesWithCursor = async ({ employeeId, cursor, limit }) => {
  const where = { employeeId };
  if (cursor) {
    where.id = { [Op.lt]: cursor };
  }

  return LeaveRequest.findAll({
    where,
    limit: limit + 1,
    order: [['id', 'DESC']]
  });
};

const listPendingManagerLeaves = async (managerId) =>
  LeaveRequest.findAll({
    where: { managerId, status: 'Pending' },
    order: [['createdAt', 'ASC']],
    include: [{ model: User, as: 'employee', attributes: ['id', 'firstName', 'lastName', 'email'] }]
  });

const resetAllLeaveBalances = async ({ totalAnnual, year }, transaction) => {
  const employees = await User.findAll({ where: { isActive: true }, attributes: ['id'], transaction });
  await Promise.all(
    employees.map((employee) =>
      LeaveBalance.upsert(
        {
          employeeId: employee.id,
          totalAnnual,
          used: 0,
          remaining: totalAnnual,
          year
        },
        { transaction }
      )
    )
  );

  return employees.length;
};

module.exports = {
  findEmployee,
  findLeaveBalance,
  createLeaveBalance,
  updateLeaveBalance,
  createLeaveRequest,
  findLeaveRequestById,
  updateLeaveRequest,
  listEmployeeLeavesWithCursor,
  listPendingManagerLeaves,
  resetAllLeaveBalances
};