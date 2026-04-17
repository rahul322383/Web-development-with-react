const { Op } = require('sequelize');
const { LeaveRequest, LeaveBalance, User } = require('../../database/initModels');

const findEmployee = (id) => User.findByPk(id);

const findLeaveBalance = (employeeId, year, transaction) =>
  LeaveBalance.findOne({
    where: { employeeId, year },
    transaction
  });

const createLeaveBalance = (payload, transaction) =>
  LeaveBalance.create(payload, { transaction });

const updateLeaveBalance = (employeeId, year, data, transaction) =>
  LeaveBalance.update(data, {
    where: { employeeId, year },
    transaction
  });

const resetAllLeaveBalances = async ({ totalAnnual, year }, transaction) => {
  const employees = await User.findAll({
    where: { isActive: true },
    attributes: ['id'],
    transaction
  });

  await Promise.all(
    employees.map((emp) =>
      LeaveBalance.upsert(
        {
          employeeId: emp.id,
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

const createLeaveRequest = (payload, transaction) =>
  LeaveRequest.create(payload, { transaction });

const findLeaveRequestById = (id, transaction) =>
  LeaveRequest.findByPk(id, {
    include: [
      {
        model: User,
        as: 'employee',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }
    ],
    transaction
  });

const updateLeaveRequest = (id, data, transaction) =>
  LeaveRequest.update(data, {
    where: { id },
    transaction
  });

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

const listPendingManagerLeaves = async (managerId) => {
  return LeaveRequest.findAll({
    where: { managerId },
    include: [
      {
        model: User,
        as: 'employee',
        attributes: [
          'id',
          'firstName',
          'lastName',
          'email',
          'employeeCode',
          'department'
        ]
      }
    ],
    order: [['createdAt', 'DESC']]
  });
};

const listTeamLeaves = async ({
  managerId,
  status,
  limit = 20,
  offset = 0
}) => {
  const where = { managerId };

  if (status) {
    where.status = status;
  }

  return LeaveRequest.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'employee',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }
    ],
    order: [['createdAt', 'DESC']],
    limit,
    offset
  });
};

const getDashboardSummary = async (employeeId) => {
  const year = new Date().getFullYear();

  const leaveBalance = await findLeaveBalance(employeeId, year);

  const recentLeaves = await LeaveRequest.findAll({
    where: { employeeId },
    limit: 5,
    order: [['createdAt', 'DESC']]
  });

  return {
    leaveBalance,
    recentLeaves
  };
};

const getLeaveStats = async ({ year }) => {
  const where = {};

  if (year) {
    where.createdAt = {
      [Op.between]: [
        new Date(`${year}-01-01`),
        new Date(`${year}-12-31`)
      ]
    };
  }

  const total = await LeaveRequest.count({ where });
  const approved = await LeaveRequest.count({
    where: { ...where, status: 'Approved' }
  });
  const pending = await LeaveRequest.count({
    where: { ...where, status: 'Pending' }
  });
  const rejected = await LeaveRequest.count({
    where: { ...where, status: 'Rejected' }
  });

  return {
    total,
    approved,
    pending,
    rejected
  };
};

const listApprovedManagerLeaves = (managerId) =>
  LeaveRequest.findAll({
    where: { managerId, status: 'Approved' },
    include: [
      {
        model: User,
        as: 'employee',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }
    ],
    order: [['createdAt', 'ASC']]
  });

module.exports = {
  findEmployee,
  findLeaveBalance,
  createLeaveBalance,
  updateLeaveBalance,
  resetAllLeaveBalances,
  createLeaveRequest,
  findLeaveRequestById,
  updateLeaveRequest,
  listEmployeeLeavesWithCursor,
  listPendingManagerLeaves,
  listTeamLeaves,
  listApprovedManagerLeaves,
  getDashboardSummary,
  getLeaveStats
};