

// const { Op } = require('sequelize');
// const { LeaveRequest, LeaveBalance, User } = require('../../database/initModels');

// /* =========================
//    EMPLOYEE / USER HELPERS
// ========================= */
// const findEmployee = (id) => User.findByPk(id);

// /* =========================
//    LEAVE BALANCE
// ========================= */
// const findLeaveBalance = (employeeId, year, transaction) =>
//   LeaveBalance.findOne({
//     where: { employeeId, year },
//     transaction
//   });

// const createLeaveBalance = (payload, transaction) =>
//   LeaveBalance.create(payload, { transaction });

// const updateLeaveBalance = (employeeId, year, data, transaction) =>
//   LeaveBalance.update(data, {
//     where: { employeeId, year },
//     transaction
//   });

// const resetAllLeaveBalances = async ({ totalAnnual, year }, transaction) => {
//   const employees = await User.findAll({
//     where: { isActive: true },
//     attributes: ['id'],
//     transaction
//   });

//   await Promise.all(
//     employees.map((emp) =>
//       LeaveBalance.upsert(
//         {
//           employeeId: emp.id,
//           totalAnnual,
//           used: 0,
//           remaining: totalAnnual,
//           year
//         },
//         { transaction }
//       )
//     )
//   );

//   return employees.length;
// };

// /* =========================
//    LEAVE REQUEST (CRUD)
// ========================= */
// const createLeaveRequest = (payload, transaction) =>
//   LeaveRequest.create(payload, { transaction });

// const findLeaveRequestById = (id, transaction) =>
//   LeaveRequest.findByPk(id, {
//     include: [
//       {
//         model: User,
//         as: 'employee',
//         attributes: ['id', 'firstName', 'lastName', 'email']
//       }
//     ],
//     transaction
//   });

// const updateLeaveRequest = (id, data, transaction) =>
//   LeaveRequest.update(data, {
//     where: { id },
//     transaction
//   });

// /* =========================
//    MY LEAVES (CURSOR PAGINATION)
// ========================= */
// const listEmployeeLeavesWithCursor = async ({ employeeId, cursor, limit }) => {
//   const where = { employeeId };

//   if (cursor) {
//     where.id = { [Op.lt]: cursor };
//   }

//   return LeaveRequest.findAll({
//     where,
//     limit: limit + 1,
//     order: [['id', 'DESC']]
//   });
// };

// /* =========================
//    MANAGER: PENDING LEAVES
// ========================= */
// const listPendingManagerLeaves = (managerId) =>
//   LeaveRequest.findAll({
//     where: { managerId, status: { [Op.in]: ['Pending', 'Approved', 'Rejected', 'Cancelled'] } },
//     include: [
//       {
//         model: User,
//         as: 'employee',
//         attributes: ['id', 'firstName', 'lastName', 'email']
//       }
//     ],
//     order: [['createdAt', 'ASC']]
//   });

// /* =========================
//    TEAM LEAVES (MANAGER)
// ========================= */
// const listTeamLeaves = async ({
//   managerId,
//   status,
//   limit = 20,
//   offset = 0
// }) => {
//   const where = { managerId };

//   if (status) {
//     where.status = status;
//   }

//   return LeaveRequest.findAndCountAll({
//     where,
//     include: [
//       {
//         model: User,
//         as: 'employee',
//         attributes: ['id', 'firstName', 'lastName', 'email']
//       }
//     ],
//     order: [['createdAt', 'DESC']],
//     limit,
//     offset
//   });
// };

// /* =========================
//    DASHBOARD / STATS
// ========================= */
// const getDashboardSummary = async (employeeId) => {
//   const year = new Date().getFullYear();

//   const leaveBalance = await findLeaveBalance(employeeId, year);

//   const recentLeaves = await LeaveRequest.findAll({
//     where: { employeeId },
//     limit: 5,
//     order: [['createdAt', 'DESC']]
//   });

//   return {
//     leaveBalance,
//     recentLeaves
//   };
// };

// const getLeaveStats = async ({ year }) => {
//   const where = {};

//   if (year) {
//     where.startDate = {
//       [Op.between]: [`${year}-01-01`, `${year}-12-31`]
//     };
//   }

//   return LeaveRequest.findAll({
//     where,
//     include: [
//       {
//         model: User,
//         as: 'employee',
//         attributes: ['id', 'firstName', 'lastName', 'email']
//       }
//     ],
//     order: [['createdAt', 'DESC']]
//   });
// };
// // approved leaves list for manager
// const listApprovedManagerLeaves = (managerId) =>
//   LeaveRequest.findAll({
//     where: { managerId, status: 'Approved' },
//     include: [
//       {
//         model: User,
//         as: 'employee',
//         attributes: ['id', 'firstName', 'lastName', 'email']
//       }
//     ],
//     order: [['createdAt', 'ASC']]
//   });

// const managerDecision = (payload, transaction) => {
//   const { managerId, role, requestId, status, decisionNote } = payload;

//   // Only Managers and HR can approve/reject
//   if (!['Manager', 'HR', 'Admin'].includes(role)) {
//     throw new Error('Unauthorized: Only Managers and HR can make decisions on leave requests');
//   }

//   return updateLeaveRequest(
//     requestId,
//     {
//       status,
//       managerDecisionNote: decisionNote,
//       managerActionDate: new Date()
//     },
//     transaction
//   );
// };  

// /* =========================
//    EXPORTS
// ========================= */
// module.exports = {
//   // employee
//   findEmployee,

//   // balance
//   findLeaveBalance,
//   createLeaveBalance,
//   updateLeaveBalance,
//   resetAllLeaveBalances,

//   // leave request
//   createLeaveRequest,
//   findLeaveRequestById,
//   updateLeaveRequest,

//   // employee leaves
//   listEmployeeLeavesWithCursor,

//   // manager
//   managerDecision,
//   listPendingManagerLeaves,
//   listTeamLeaves,
//   listApprovedManagerLeaves,

//   // dashboard
//   getDashboardSummary,
//   getLeaveStats
// };



const { Op } = require('sequelize');
const { LeaveRequest, LeaveBalance, User } = require('../../database/initModels');

/* =========================
   EMPLOYEE / USER HELPERS
========================= */
const findEmployee = (id) => User.findByPk(id);

/* =========================
   LEAVE BALANCE
========================= */
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

/* =========================
   MY LEAVES (CURSOR PAGINATION)
========================= */
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

/* =========================
   MANAGER: PENDING LEAVES
========================= */
const listPendingManagerLeaves = (managerId) =>
  LeaveRequest.findAll({
    where: { managerId, status: { [Op.in]: ['Pending', 'Approved', 'Rejected', 'Cancelled'] } },
    include: [
      {
        model: User,
        as: 'employee',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }
    ],
    order: [['createdAt', 'ASC']]
  });

/* =========================
   TEAM LEAVES (MANAGER)
========================= */
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

/* =========================
   DASHBOARD / STATS
========================= */
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
      [Op.between]: [`${year}-01-01`, `${year}-12-31`]
    };
  }

  const total = await LeaveRequest.count({ where });
  const approved = await LeaveRequest.count({ where: { ...where, status: 'Approved' } });
  const pending = await LeaveRequest.count({ where: { ...where, status: 'Pending' } });
  const rejected = await LeaveRequest.count({ where: { ...where, status: 'Rejected' } });

  return {
    total,
    approved,
    pending,
    rejected
  };
};
// approved leaves list for manager
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

/* =========================
   EXPORTS
========================= */
module.exports = {
  // employee
  findEmployee,

  // balance
  findLeaveBalance,
  createLeaveBalance,
  updateLeaveBalance,
  resetAllLeaveBalances,

  // leave request
  createLeaveRequest,
  findLeaveRequestById,
  updateLeaveRequest,

  // employee leaves
  listEmployeeLeavesWithCursor,

  // manager
  listPendingManagerLeaves,
  listTeamLeaves,
  listApprovedManagerLeaves,

  // dashboard
  getDashboardSummary,
  getLeaveStats
};