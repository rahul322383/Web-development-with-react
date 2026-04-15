


const sequelize = require('../../database/sequelize');
const env = require('../../config/env');
const leaveRepository = require('./leaveRepository');
const { cursorPaginate } = require('../../utils/pagination');
const { logAuditEvent } = require('../../utils/auditLogger');
const { clearCacheKeys } = require('../../utils/cache');
const { LeaveRequest, LeaveBalance } = require('../../database/initModels');
const { Op } = require('sequelize');
 
// 📌 Calculate leave days
const calculateRequestedDays = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
};

// 📌 Ensure Leave Balance Exists
const ensureLeaveBalance = async (employeeId, transaction) => {
  const year = new Date().getFullYear();
  const existing = await leaveRepository.findLeaveBalance(employeeId, year);
  if (existing) return existing;

  return leaveRepository.createLeaveBalance(
    {
      employeeId,
      totalAnnual: env.DEFAULT_ANNUAL_LEAVE,
      used: 0,
      remaining: env.DEFAULT_ANNUAL_LEAVE,
      year
    },
    transaction
  );
};


const applyForLeave = async ({
  employeeId,
  startDate,
  endDate,
  reason,
  ipAddress
}) => {
  try {
    const empId = Number(employeeId);

    // ✅ Validate employeeId
    if (!empId || isNaN(empId)) {
      return { success: false, message: "Invalid employeeId" };
    }

    // ✅ Parse dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start) || isNaN(end)) {
      return { success: false, message: "Invalid date format" };
    }

    if (start > end) {
      return { success: false, message: "startDate cannot be after endDate" };
    }

    // ✅ Prevent past leave
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return { success: false, message: "Cannot apply for past dates" };
    }

    return await sequelize.transaction(async (transaction) => {

      // ✅ Fetch employee
      const employee = await leaveRepository.findEmployee(empId);

      if (!employee) {
        throw new Error("Employee not found");
      }

      if (!employee.managerId) {
        throw new Error("Employee manager mapping missing");
      }

      // ✅ Validate manager exists
      const manager = await leaveRepository.findEmployee(employee.managerId);
      console.log("Manager found:", manager ? manager.id : "No manager");

      if (!manager) {
        throw new Error("Assigned manager not found");
      }

      // ✅ Prevent overlapping leaves
      const overlapping = await leaveRepository.findOverlappingLeaves(
        empId,
        start,
        end,
        transaction
      );

      if (overlapping) {
        throw new Error("Leave already exists for selected dates");
      }

      // ✅ Calculate days
      const daysRequested = calculateRequestedDays(start, end);

      // ✅ Create leave
      const request = await leaveRepository.createLeaveRequest(
        {
          employeeId: empId,
          managerId: employee.managerId, // keep for history only
          startDate: start,
          endDate: end,
          reason,
          daysRequested,
          status: "Pending"
        },
        transaction
      );

      // ✅ Audit log
      await logAuditEvent({
        userId: empId,
        moduleName: "Leave",
        actionType: "CREATE",
        oldData: null,
        newData: request,
        ipAddress
      });

      return {
        success: true,
        message: "Leave request submitted successfully",
        data: request
      };
    });

  } catch (error) {
    console.error("Apply Leave Error:", error);

    return {
      success: false,
      message: error.message || "Something went wrong"
    };
  }
};


// const applyForLeave = async ({
//   employeeId,
//   startDate,
//   endDate,
//   reason,
//   ipAddress
// }) => {
//   try {
//     const empId = Number(employeeId);
//     if (!empId || isNaN(empId)) {
//       return { success: false, message: "Invalid employeeId" };
//     }

//     const start = new Date(startDate);
//     const end = new Date(endDate);

//     if (isNaN(start) || isNaN(end)) {
//       return { success: false, message: "Invalid date format" };
//     }

//     if (start > end) {
//       return { success: false, message: "startDate cannot be after endDate" };
//     }

//     const daysRequested = calculateRequestedDays(start, end);

//     return await sequelize.transaction(async (transaction) => {

//       const employee = await leaveRepository.findEmployee(empId);

//       if (!employee?.managerId) {
//         throw new Error("Employee manager mapping missing");
//       }

//       const request = await leaveRepository.createLeaveRequest(
//         {
//           employeeId: empId,
//           managerId: employee.managerId,
//           startDate: start,
//           endDate: end,
//           reason,
//           daysRequested,
//           status: "Pending"
//         },
//         transaction
//       );

//       await logAuditEvent({
//         userId: empId,
//         moduleName: "Leave",
//         actionType: "CREATE",
//         oldData: null,
//         newData: request,
//         ipAddress
//       });

//       return {
//         success: true,
//         message: "Leave request submitted successfully",
//         data: request
//       };
//     });

//   } catch (error) {
//     return {
//       success: false,
//       message: error.message || "Something went wrong"
//     };
//   }
// };

const listTeamLeaves = async (managerId) => {
  try {
    const data = await leaveRepository.listTeamLeaves(managerId);

    return {
      success: true,
      data
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

const managerDecision = async ({
  managerId,
  role,
  requestId,
  status,
  decisionNote,
  ipAddress
}) => {
  try {
    if (!["Approved", "Rejected"].includes(status)) {
      throw new Error("Invalid status value");
    }

    return await sequelize.transaction(async (transaction) => {

      const leaveRequest = await LeaveRequest.findByPk(requestId, {
        transaction,
        lock: transaction.LOCK.UPDATE
      });

      if (!leaveRequest) {
        throw new Error("Leave request not found");
      }

      if (leaveRequest.status !== "Pending") {
        throw new Error("Already processed");
      }

      if (
        leaveRequest.managerId !== managerId &&
        !["Admin", "HR"].includes(role)
      ) {
        throw new Error("Not authorized");
      }

      // 🔥 UPDATE STATUS FIRST
      await leaveRepository.updateLeaveRequest(
        requestId,
        { status, decisionNote },
        transaction
      );

      let year = new Date(leaveRequest.startDate).getFullYear();

      // 🔥 ONLY ON APPROVAL → DEDUCT BALANCE
      if (status === "Approved") {

        const balance = await leaveRepository.findLeaveBalance(
          leaveRequest.employeeId,
          year,
          transaction
        );

        if (!balance || balance.remaining < leaveRequest.daysRequested) {
          throw new Error("Insufficient balance at approval time");
        }

        await leaveRepository.updateLeaveBalance(
          leaveRequest.employeeId,
          year,
          {
            used: balance.used + leaveRequest.daysRequested,
            remaining: balance.remaining - leaveRequest.daysRequested
          },
          transaction
        );
      }

      await logAuditEvent({
        userId: managerId,
        moduleName: "Leave",
        actionType: status === "Approved" ? "APPROVE" : "REJECT",
        oldData: { status: "Pending" },
        newData: { status, decisionNote },
        ipAddress
      });

      await clearCacheKeys([
        `dashboard_summary:${leaveRequest.employeeId}:${year}`,
        `dashboard_summary:${managerId}:${year}`
      ]);

      const updated = await leaveRepository.findLeaveRequestById(
        requestId,
        transaction
      );

      return {
        success: true,
        message: `Leave ${status.toLowerCase()} successfully`,
        data: updated
      };
    });

  } catch (error) {
    return {
      success: false,
      message: error.message || "Something went wrong"
    };
  }
};


// 📄 List My Leaves
const listMyLeaves = async ({ employeeId, cursor, limit }) => {
  try {
    const rows = await leaveRepository.listEmployeeLeavesWithCursor({
      employeeId,
      cursor,
      limit
    });

    return {
      success: true,
      data: cursorPaginate({ rows, limit, cursorKey: 'id' })
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// 📄 Manager Pending Leaves
const listPendingLeavesForManager = async (managerId) => {
  try {
    const data = await leaveRepository.listPendingManagerLeaves(managerId);

    return {
      success: true,
      message: "Pending leaves fetched successfully",
      count: data.length,
      data
    };
  } catch (error) {
    console.error("Error fetching pending leaves:", error);

    return {
      success: false,
      message: "Failed to fetch pending leaves",
      error: error.message
    };
  }
};





const getMyLeaveBalance = async (employeeId) => {
  try {
    const year = new Date().getFullYear();

    // leave balance
    const leaveBalance = await leaveRepository.findLeaveBalance(employeeId, year);

    // full leave records
    const leaves = await LeaveRequest.findAll({
      where: {
        employeeId,
        createdAt: {
          [Op.gte]: new Date(`${year}-01-01`),
          [Op.lte]: new Date(`${year}-12-31`)
        }
      },
      order: [['createdAt', 'DESC']]
    });

    // group full data
    const groupedLeaves = {
      all: leaves,
      approved: [],
      rejected: [],
      pending: []
    };

    leaves.forEach((leave) => {
      const status = leave.status?.toLowerCase();

      if (status === 'approved') groupedLeaves.approved.push(leave);
      else if (status === 'rejected') groupedLeaves.rejected.push(leave);
      else groupedLeaves.pending.push(leave);
    });

    // default balance
    if (!leaveBalance) {
      return {
        totalAnnual: env.DEFAULT_ANNUAL_LEAVE,
        used: 0,
        remaining: env.DEFAULT_ANNUAL_LEAVE,
        year,
        leaves: groupedLeaves
      };
    }

    return {
      ...leaveBalance.toJSON(),
      leaves: groupedLeaves
    };

  } catch (error) {
    throw error;
  }
};





// 🔁 Yearly Reset
const yearlyLeaveReset = async (year) => {
  try {
    await sequelize.transaction(async (transaction) => {
      await leaveRepository.resetAllLeaveBalances(
        {
          totalAnnual: env.DEFAULT_ANNUAL_LEAVE,
          year
        },
        transaction
      );
    });

    return {
      success: true,
      message: 'Leave balances reset successfully'
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
};


const deleteLeaveRequest = (id, transaction) =>
  LeaveRequest.destroy({
    where: { id },
    transaction
  });

const updateLeaveRequest = (id, data, transaction) =>
  LeaveRequest.update(data, {
    where: { id },
    transaction
  });

const findLeaveRequestById = (id, transaction) =>
  LeaveRequest.findByPk(id, { transaction });

const findLeaveBalance = (employeeId, year, transaction) =>
  LeaveBalance.findOne({
    where: { employeeId, year },
    transaction
  });

const updateLeaveBalance = (employeeId, year, data, transaction) =>
  LeaveBalance.update(data, {
    where: { employeeId, year },
    transaction
  }); 

const createLeaveBalance = async (payload, transaction) => LeaveBalance.create(payload, { transaction });

const createLeaveRequest = async (payload, transaction) => LeaveRequest.create(payload, { transaction });  

//find employee function is added in repository to be used in service layer for better transaction management and code organization.

const findEmployee = async (id) => User.findByPk(id);
const getLeaveStats = async ({ year }) => {
  try {
    const stats = await leaveRepository.getLeaveStats({ year });

    return {
      success: true,
      data: stats
    };
  } catch (error) {
    return {
      success: false,
      message: error.message
    };
  }
};

// get dashboard summary function is added in repository to be used in service layer for better transaction management and code organization.

const getDashboardSummary = async ({ userId, year }) => {
  const selectedYear = year || new Date().getFullYear();

  const leaveBalance = await LeaveBalance.findOne({
    where: { employeeId: userId, year: selectedYear }
  });

  const recentLeaves = await LeaveRequest.findAll({
    where: { employeeId: userId },
    limit: 5,
    order: [['createdAt', 'DESC']]
  });

  return {
    leaveBalance,
    recentLeaves
  };
};

// Add these methods to your existing leaveService

const getHRTeamIds = async () => {
  try {
    const hrUsers = await prisma.user.findMany({
      where: {
        OR: [
          { role: 'HR' },
          { role: 'ADMIN' },
          { role: 'HR_MANAGER' }
        ]
      },
      select: {
        id: true
      }
    });
    return hrUsers.map(user => user.id);
  } catch (error) {
    console.error('Error fetching HR team IDs:', error);
    return [];
  }
};

const getAdminIds = async () => {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: 'ADMIN'
      },
      select: {
        id: true
      }
    });
    return admins.map(user => user.id);
  } catch (error) {
    console.error('Error fetching admin IDs:', error);
    return [];
  }
};

const getAllEmployeeIds = async () => {
  try {
    const employees = await prisma.user.findMany({
      where: {
        role: 'EMPLOYEE'
      },
      select: {
        id: true
      }
    });
    return employees.map(user => user.id);
  } catch (error) {
    console.error('Error fetching employee IDs:', error);
    return [];
  }
};

const getTeamMembers = async (managerId) => {
  try {
    const teamMembers = await prisma.user.findMany({
      where: {
        managerId: managerId
      },
      select: {
        id: true
      }
    });
    return teamMembers.map(user => user.id);
  } catch (error) {
    console.error('Error fetching team members:', error);
    return [];
  }
};


module.exports = {
   getHRTeamIds,
  getAdminIds,
  getAllEmployeeIds,
  getTeamMembers,
  getDashboardSummary,
  listTeamLeaves,
  findEmployee,
  findLeaveBalance,
  getLeaveStats,
  createLeaveBalance,
  updateLeaveBalance,
  createLeaveRequest,
  deleteLeaveRequest,
  updateLeaveRequest,
  findLeaveRequestById,
  applyForLeave,
  managerDecision,
  listMyLeaves,
  listPendingLeavesForManager,
  getMyLeaveBalance,
  yearlyLeaveReset
};