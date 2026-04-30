'use strict';

const { Op } = require('sequelize');
const models = require('../../database/initModels');
const { Company, User, Payroll,
  LeaveRequest, Attendance } = models;

const MAX_LIMIT = 100;

// ─────────────────────────────────────────────────────────────
// CORE CRUD
// ─────────────────────────────────────────────────────────────

const createCompany = async (data, transaction = null) =>
  Company.create(data, { transaction });

const findCompanyById = async (id, options = {}) => {
  const { includeInactive = false, attributes = null } = options;
  const where = { id };
  if (!includeInactive) where.isActive = true;
  return Company.findOne({ where, attributes: attributes || undefined });
};

const findCompanyBySlug = async (slug) =>
  Company.findOne({ where: { slug, isActive: true } });

const findCompanyByName = async (name) =>
  Company.findOne({
    where: { name: { [Op.like]: `%${name}%` }, isActive: true },
  });

const updateCompany = async (id, data, transaction = null) => {
  const [affected] = await Company.update(data, {
    where: { id },
    transaction,
  });
  if (!affected) return null;
  return findCompanyById(id, { includeInactive: true });
};

// ─────────────────────────────────────────────────────────────
// DEACTIVATE / REACTIVATE
// ─────────────────────────────────────────────────────────────

const deactivateCompany = async (id, transaction = null) => {
  await Company.update(
    { isActive: false },
    { where: { id, isActive: true }, transaction }
  );
  await User.update(
    { isActive: false },
    { where: { companyId: id }, transaction }
  );
};

// ✅ NEW
const reactivateCompany = async (id, transaction = null) => {
  await Company.update(
    { isActive: true },
    { where: { id, isActive: false }, transaction }
  );
  await User.update(
    { isActive: true },
    { where: { companyId: id }, transaction }
  );
};

// ─────────────────────────────────────────────────────────────
// LOGO
// ─────────────────────────────────────────────────────────────

const updateLogo = async (id, { logoUrl, logoPublicId }, transaction = null) => {
  await Company.update(
    { logoUrl, logoPublicId },
    { where: { id }, transaction }
  );
  return findCompanyById(id, { attributes: ['id', 'logoUrl', 'logoPublicId'] });
};

const getLogoPublicId = async (id) => {
  const row = await Company.findOne({
    where: { id }, attributes: ['logoPublicId'],
  });
  return row?.logoPublicId ?? null;
};

// ─────────────────────────────────────────────────────────────
// SETTINGS
// ─────────────────────────────────────────────────────────────

// ✅ NEW
const findCompanySettings = async (id) =>
  Company.findOne({
    where: { id },
    attributes: [
      'id', 'workingHoursPerDay', 'workingDaysPerWeek',
      'annualLeaveQuota', 'timezone', 'currency',
      'fiscalYearStart', 'subscriptionPlan', 'subscriptionExpiresAt',
    ],
  });

// ─────────────────────────────────────────────────────────────
// USERS (company-scoped)
// ─────────────────────────────────────────────────────────────

// ✅ NEW — paginated list of all users in a company
const findCompanyUsers = async (companyId, {
  page = 1,
  limit = 20,
  search = null,
  role = null,
} = {}) => {
  limit = Math.min(Number(limit) || 20, MAX_LIMIT);
  page = Math.max(Number(page) || 1, 1);
  const offset = (page - 1) * limit;

  const where = { companyId };

  if (search) {
    where[Op.or] = [
      { firstName: { [Op.like]: `%${search}%` } },
      { lastName: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
    ];
  }

  const include = [];
  if (role) {
    include.push({
      association: 'role',
      where: { name: role },
      attributes: ['id', 'name'],
    });
  } else {
    include.push({
      association: 'role',
      attributes: ['id', 'name'],
    });
  }

  const { count, rows } = await User.findAndCountAll({
    where,
    include,
    attributes: { exclude: ['passwordHash'] },
    limit,
    offset,
    order: [['createdAt', 'DESC']],
  });

  return {
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
    users: rows,
  };
};

// ✅ NEW — assign user to company (onboarding)
const assignUserToCompany = async (userId, companyId, transaction = null) => {
  const [affected] = await User.update(
    { companyId, isActive: true },
    { where: { id: userId }, transaction }
  );
  return affected > 0;
};

// ✅ NEW — remove user from company (offboarding)
const removeUserFromCompany = async (userId, companyId, transaction = null) => {
  const [affected] = await User.update(
    { companyId: null, isActive: false },
    { where: { id: userId, companyId }, transaction }
  );
  return affected > 0;
};

// ✅ NEW — update user's role within the company
const updateUserRole = async (userId, companyId, roleId, transaction = null) => {
  const [affected] = await User.update(
    { roleId },
    { where: { id: userId, companyId }, transaction }
  );
  return affected > 0;
};

// ─────────────────────────────────────────────────────────────
// STATS
// ─────────────────────────────────────────────────────────────

const getCompanyStats = async (companyId) => {
  const [total, active, payrollSum] = await Promise.all([
    User.count({ where: { companyId } }),
    User.count({ where: { companyId, isActive: true } }),
    Payroll.sum('netSalary', {
      where: { status: { [Op.in]: ['Processed', 'Locked'] } },
      include: [{
        model: User,
        as: 'employee',
        attributes: [],
        required: true,
        where: { companyId },
      }],
    }),
  ]);

  return {
    totalEmployees: total,
    activeEmployees: active,
    inactiveEmployees: total - active,
    totalPayroll: Number(payrollSum || 0),
  };
};

const getCompanyDashboard = async (companyId, year) => {
  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999));

  const [
    totalEmployees,
    activeEmployees,
    leaveStats,
    payrollSum,
    attendanceStats,
  ] = await Promise.all([

    // 👥 Total employees
    User.count({ where: { companyId } }),

    // 🟢 Active employees
    User.count({ where: { companyId, isActive: true } }),

    // 📝 Leave stats (✅ already correct — table has company_id)
    LeaveRequest.findAll({
      attributes: [
        'status',
        [
          require('sequelize').fn('COUNT', require('sequelize').col('id')),
          'count'
        ],
      ],
      where: {
        companyId,
        startDate: { [Op.between]: [start, end] },
      },
      group: ['status'],
      raw: true,
    }),

    // 💰 Payroll sum (✅ already using JOIN correctly)
    Payroll.sum('netSalary', {
      where: { status: { [Op.in]: ['Processed', 'Locked'] } },
      include: [{
        model: User,
        as: 'employee',
        attributes: [],
        required: true,
        where: { companyId },
      }],
    }),

    // 📊 Attendance stats (🔥 FIXED HERE)
    Attendance.findAll({
      attributes: [
        'status',
        [
          require('sequelize').fn('COUNT', require('sequelize').col('Attendance.id')),
          'count'
        ],
      ],
      include: [
        {
          model: User,
          as: 'employee',
          attributes: [],
          required: true,
          where: { companyId }, // ✅ moved here
        }
      ],
      where: {
        date: { [Op.between]: [start, end] }, // ✅ removed companyId from here
      },
      group: ['status'],
      raw: true,
    }),
  ]);

  // 🧠 Shape leave stats
  const leaveMap = {};
  leaveStats.forEach(({ status, count }) => {
    leaveMap[status] = Number(count);
  });

  // 🧠 Shape attendance stats
  const attMap = {};
  attendanceStats.forEach(({ status, count }) => {
    attMap[status] = Number(count);
  });

  const totalAttendance = Object.values(attMap).reduce((s, v) => s + v, 0);

  const presentDays = (attMap.present || 0) + (attMap.late || 0);

  const attendancePct = totalAttendance
    ? parseFloat(((presentDays / totalAttendance) * 100).toFixed(1))
    : 0;

  return {
    employees: {
      total: totalEmployees,
      active: activeEmployees,
      inactive: totalEmployees - activeEmployees,
    },

    leaves: {
      approved: leaveMap.Approved || 0,
      pending: leaveMap.Pending || 0,
      rejected: leaveMap.Rejected || 0,
    },

    attendance: {
      present: attMap.present || 0,
      absent: attMap.absent || 0,
      late: attMap.late || 0,
      onLeave: attMap.on_leave || 0,
      attendancePct,
    },

    payroll: {
      totalPaid: Number(payrollSum || 0),
      avgPerEmployee: activeEmployees
        ? parseFloat((Number(payrollSum || 0) / activeEmployees).toFixed(2))
        : 0,
    },
  };
};
// ─────────────────────────────────────────────────────────────
// SUBSCRIPTION
// ─────────────────────────────────────────────────────────────

// ✅ NEW
const updateSubscription = async (id, { plan, expiresAt }, transaction = null) => {
  await Company.update(
    { subscriptionPlan: plan, subscriptionExpiresAt: expiresAt },
    { where: { id }, transaction }
  );
  return findCompanyById(id, {
    includeInactive: true,
    attributes: ['id', 'subscriptionPlan', 'subscriptionExpiresAt'],
  });
};

// ─────────────────────────────────────────────────────────────
// LISTING
// ─────────────────────────────────────────────────────────────

const listCompanies = async ({
  page = 1,
  limit = 20,
  search = null,
  isActive = null,
} = {}) => {
  limit = Math.min(Number(limit) || 20, MAX_LIMIT);
  page = Math.max(Number(page) || 1, 1);
  const offset = (page - 1) * limit;
  const where = {};

  if (isActive === 'true') where.isActive = true;
  if (isActive === 'false') where.isActive = false;
  if (search) where.name = { [Op.like]: `%${search}%` };

  const { count, rows } = await Company.findAndCountAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    attributes: ['id', 'name', 'slug', 'isActive', 'subscriptionPlan', 'createdAt'],
  });

  return {
    total: count,
    page,
    limit,
    totalPages: Math.ceil(count / limit),
    companies: rows,
  };
};

// ─────────────────────────────────────────────────────────────

module.exports = {
  createCompany,
  findCompanyById,
  findCompanyBySlug,
  findCompanyByName,
  updateCompany,
  deactivateCompany,
  reactivateCompany,         // ✅ NEW
  updateLogo,
  getLogoPublicId,
  findCompanySettings,       // ✅ NEW
  findCompanyUsers,          // ✅ NEW
  assignUserToCompany,       // ✅ NEW
  removeUserFromCompany,     // ✅ NEW
  updateUserRole,            // ✅ NEW
  getCompanyStats,
  getCompanyDashboard,       // ✅ NEW
  updateSubscription,        // ✅ NEW
  listCompanies,
};