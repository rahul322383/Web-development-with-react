// 'use strict';

// const { Op }   = require('sequelize');
// const getModels = () => require('../../database/initModels');

// // ─────────────────────────────────────────────────────────────
// //  CORE CRUD
// // ─────────────────────────────────────────────────────────────

// const createCompany = async (data, transaction = null) => {
//   const { Company } = getModels();
//   return Company.create(data, { transaction });
// };

// const findCompanyById = async (id) => {
//   const { Company } = getModels();
//   return Company.findByPk(id);
// };

// const findCompanyBySlug = async (slug) => {
//   const { Company } = getModels();
//   return Company.findOne({ where: { slug } });
// };

// const findCompanyByName = async (name) => {
//   const { Company } = getModels();
//   return Company.findOne({
//     where: { name: { [Op.like]: name } },
//   });
// };

// const updateCompany = async (id, data, transaction = null) => {
//   const { Company } = getModels();
//   const [, rows] = await Company.update(data, {
//     where: { id },
//     returning: true,
//     transaction,
//   });
//   return rows?.[0] ?? null;
// };

// // soft-delete via paranoid
// const deactivateCompany = async (id, transaction = null) => {
//   const { Company, User } = getModels();

//   await Company.update({ isActive: false }, { where: { id }, transaction });
//   await User.update({ isActive: false },    { where: { companyId: id }, transaction });
//   await Company.destroy({ where: { id }, transaction }); // sets deleted_at
// };

// // ─────────────────────────────────────────────────────────────
// //  LOGO
// // ─────────────────────────────────────────────────────────────

// const updateLogo = async (id, { logoUrl, logoPublicId }, transaction = null) => {
//   const { Company } = getModels();
//   await Company.update({ logoUrl, logoPublicId }, { where: { id }, transaction });
//   return Company.findByPk(id);
// };

// const getLogoPublicId = async (id) => {
//   const { Company } = getModels();
//   const row = await Company.findByPk(id, { attributes: ['logoPublicId'] });
//   return row?.logoPublicId ?? null;
// };

// // ─────────────────────────────────────────────────────────────
// //  STATS  (used by dashboard summary)
// // ─────────────────────────────────────────────────────────────

// const getCompanyStats = async (companyId) => {
//   const { User, Payroll } = getModels();

//   const [total, active, payrollSum] = await Promise.all([
//     User.count({ where: { companyId } }),
//     User.count({ where: { companyId, isActive: true } }),
//     Payroll.sum('netSalary', {
//       where: { status: { [Op.in]: ['Processed', 'Locked'] } },
//       include: [{ model: User, as: 'employee', attributes: [], where: { companyId }, required: true }],
//     }),
//   ]);

//   return {
//     totalEmployees:  total,
//     activeEmployees: active,
//     totalPayroll:    parseFloat(Number(payrollSum || 0).toFixed(2)),
//   };
// };

// // ─────────────────────────────────────────────────────────────
// //  LISTING  (admin/super-admin use)
// // ─────────────────────────────────────────────────────────────

// const listCompanies = async ({ page = 1, limit = 20, search, isActive } = {}) => {
//   const { Company } = getModels();

//   const where = {};
//   if (typeof isActive === 'boolean') where.isActive = isActive;
//   if (search) where.name = { [Op.like]: `%${search}%` };

//   const offset = (page - 1) * limit;

//   const { count, rows } = await Company.findAndCountAll({
//     where,
//     limit,
//     offset,
//     order: [['createdAt', 'DESC']],
//   });

//   return { total: count, page, limit, companies: rows };
// };

// module.exports = {
//   createCompany,
//   findCompanyById,
//   findCompanyBySlug,
//   findCompanyByName,
//   updateCompany,
//   deactivateCompany,
//   updateLogo,
//   getLogoPublicId,
//   getCompanyStats,
//   listCompanies,
// };

'use strict';

const { Op } = require('sequelize');
const models = require('../../database/initModels');

const { Company, User, Payroll } = models;

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

const MAX_LIMIT = 100;

// ─────────────────────────────────────────────────────────────
// CORE CRUD
// ─────────────────────────────────────────────────────────────

const createCompany = async (data, transaction = null) => {
  return Company.create(data, { transaction });
};

const findCompanyById = async (id, options = {}) => {
  const { includeInactive = false, attributes = null } = options;

  const where = { id };

  if (!includeInactive) {
    where.isActive = true;
  }

  return Company.findOne({
    where,
    attributes,
  });
};

const findCompanyBySlug = async (slug) => {
  return Company.findOne({
    where: {
      slug,
      isActive: true,
    },
  });
};

const findCompanyByName = async (name) => {
  return Company.findOne({
    where: {
      name: {
        [Op.like]: `%${name}%`,
      },
      isActive: true,
    },
  });
};

const updateCompany = async (id, data, transaction = null) => {
  const [affected] = await Company.update(data, {
    where: { id, isActive: true },
    transaction,
  });

  if (!affected) return null;

  return findCompanyById(id);
};

// ─────────────────────────────────────────────────────────────
// DEACTIVATE (SAFE + CONSISTENT)
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

  // optional: keep or remove paranoid delete
  // await Company.destroy({ where: { id }, transaction });
};

// ─────────────────────────────────────────────────────────────
// LOGO
// ─────────────────────────────────────────────────────────────

const updateLogo = async (id, { logoUrl, logoPublicId }, transaction = null) => {
  await Company.update(
    { logoUrl, logoPublicId },
    { where: { id, isActive: true }, transaction }
  );

  return findCompanyById(id, {
    attributes: ['id', 'logoUrl', 'logoPublicId'],
  });
};

const getLogoPublicId = async (id) => {
  const row = await Company.findOne({
    where: { id },
    attributes: ['logoPublicId'],
  });

  return row?.logoPublicId ?? null;
};

// ─────────────────────────────────────────────────────────────
// STATS (OPTIMIZED)
// ─────────────────────────────────────────────────────────────

const getCompanyStats = async (companyId) => {
  const [total, active, payrollSum] = await Promise.all([
    User.count({ where: { companyId } }),

    User.count({
      where: { companyId, isActive: true },
    }),

    Payroll.sum('netSalary', {
      where: {
        status: { [Op.in]: ['Processed', 'Locked'] },
      },
      include: [
        {
          model: User,
          as: 'employee',
          attributes: [],
          required: true,
          where: { companyId },
        },
      ],
    }),
  ]);

  return {
    totalEmployees: total,
    activeEmployees: active,
    totalPayroll: Number(payrollSum || 0),
  };
};

// ─────────────────────────────────────────────────────────────
// LISTING (SAFE PAGINATION)
// ─────────────────────────────────────────────────────────────

const listCompanies = async ({
  page = 1,
  limit = 20,
  search,
  isActive,
} = {}) => {
  limit = Math.min(Number(limit) || 20, MAX_LIMIT);
  page = Math.max(Number(page) || 1, 1);

  const offset = (page - 1) * limit;

  const where = {};

  if (typeof isActive === 'boolean') {
    where.isActive = isActive;
  }

  if (search) {
    where.name = {
      [Op.iLike]: `%${search}%`,
    };
  }

  const { count, rows } = await Company.findAndCountAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    attributes: ['id', 'name', 'slug', 'isActive', 'createdAt'],
  });

  return {
    total: count,
    page,
    limit,
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
  updateLogo,
  getLogoPublicId,
  getCompanyStats,
  listCompanies,
};