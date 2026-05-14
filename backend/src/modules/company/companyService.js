'use strict';

const sequelize = require('../../database/sequelize');
const { cloudinary, uploadBuffer } = require('../../config/cloudinary');
const companyRepository = require('./companyRepository');
const { User, Role } = require('../../database/initModels');
const { sendNotification, sendAuditLog, sendBulkNotifications } = require('../../config/socket');
const { assertPermission } = require('../../utils/permissions');

const ok = (data = {}, message = '') => ({ success: true, message, data });
const response = (message, statusCode = 500) => ({ success: false, message, statusCode });

const safeExecute = async (fn) => {
  try {
    return await fn();
  } catch (err) {
    return response(err.message || 'Internal error', err.statusCode || 500);
  }
};

const withTransaction = (fn) => sequelize.transaction(fn);

const toSlug = (name) =>
  name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const generateUniqueSlug = async (name) => {
  const base = toSlug(name);
  let slug = base, counter = 1;
  while (await companyRepository.findCompanyBySlug(slug)) {
    slug = `${base}-${counter++}`;
  }
  return slug;
};

const buildAudit = (event, userId, meta = {}) => ({
  event, userId, metadata: meta, timestamp: new Date().toISOString(),
});

const assertCompanyAccess = (actor, companyId) => {
  // No logged-in user
  if (!actor) {
    const err = new Error('Unauthorized');
    err.statusCode = 401;
    throw err;
  }
  
  
  if (actor.role === 'Admin') {
    return true;
  }


  if (
    actor.companyId &&
    Number(actor.companyId) !== Number(companyId)
  ) {
    const err = new Error('Access denied to this company');
    err.statusCode = 403;
    throw err;
  }

  return true;
};

const validateCompanyPayload = (payload) => {
  if (!payload.name) {
    const err = new Error('Company name is required');
    err.statusCode = 400;
    throw err;
  }
  if (payload.workingHoursPerDay > 24) {
    const err = new Error('Invalid working hours per day');
    err.statusCode = 400;
    throw err;
  }
  if (payload.workingDaysPerWeek > 7) {
    const err = new Error('Invalid working days per week');
    err.statusCode = 400;
    throw err;
  }
};

const checkSubscriptionStatus = (company) => {
  if (!company.subscriptionExpiresAt) {
    return { active: true, plan: company.subscriptionPlan, daysLeft: null };
  }
  const now = new Date();
  const expires = new Date(company.subscriptionExpiresAt);
  const daysLeft = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));
  return {
    active: daysLeft > 0,
    plan: company.subscriptionPlan,
    daysLeft: Math.max(daysLeft, 0),
    expiredAt: daysLeft <= 0 ? company.subscriptionExpiresAt : null,
  };
};

const createCompany = (payload, actor) =>
  safeExecute(async () => {
    const perm = assertPermission(actor, 'CREATE_COMPANY');
    if (!perm.allowed) return response(perm.message, 403);

    const existing = await companyRepository.findCompanyByName(payload.name);
    if (existing) return response('Company already exists', 409);

    const slug = await generateUniqueSlug(payload.name);

    const company = await withTransaction((t) =>
      companyRepository.createCompany({
        ...payload,
        slug,
        country: payload.country ?? 'India',
        timezone: payload.timezone ?? 'Asia/Kolkata',
        currency: payload.currency ?? 'INR',
        workingHoursPerDay: payload.workingHoursPerDay ?? 8,
        workingDaysPerWeek: payload.workingDaysPerWeek ?? 5,
        annualLeaveQuota: payload.annualLeaveQuota ?? 21,
      }, t)
    );

    sendAuditLog(buildAudit('COMPANY_CREATED', actor?.id, { companyId: company.id }));

    return ok({ company }, 'Company created successfully');
  });

const getCompany = (companyId, actor) =>
  safeExecute(async () => {
    if (actor.companyId && Number(actor.companyId) !== Number(companyId)) {
      const perm = assertPermission(actor, 'VIEW_ANY_COMPANY');
      if (!perm.allowed) return response('Access denied', 403);
    }
    const company = await companyRepository.findCompanyById(companyId);
    if (!company) return response('Company not found', 404);
    return ok({ company });
  });

const updateCompany = (companyId, payload, actor) =>
  safeExecute(async () => {
    const perm = assertPermission(actor, 'UPDATE_COMPANY');
    if (!perm.allowed) return response(perm.message, 403);

    assertCompanyAccess(actor, companyId);

    const company = await companyRepository.findCompanyById(companyId);
    if (!company) return response('Company not found', 404);

    const { slug, logoUrl, logoPublicId, ...safePayload } = payload;

    await withTransaction((t) =>
      companyRepository.updateCompany(companyId, safePayload, t)
    );

    const updated = await companyRepository.findCompanyById(companyId);

    sendAuditLog(buildAudit('COMPANY_UPDATED', actor?.id, {
      companyId, fields: Object.keys(safePayload),
    }));

    return ok({ company: updated }, 'Company updated successfully');
  });

const reactivateCompany = (companyId, actor) =>
  safeExecute(async () => {
    const perm = assertPermission(actor, 'UPDATE_COMPANY');
    if (!perm.allowed) return response(perm.message, 403);

    const company = await companyRepository.findCompanyById(companyId, { includeInactive: true });
    if (!company) return response('Company not found', 404);
    if (company.isActive) return response('Company is already active', 409);

    await withTransaction((t) =>
      companyRepository.reactivateCompany(companyId, t)
    );

    sendAuditLog(buildAudit('COMPANY_REACTIVATED', actor?.id, { companyId }));

    return ok({}, 'Company reactivated successfully');
  });

const deactivateCompany = (companyId, actor) =>
  safeExecute(async () => {
    const perm = assertPermission(actor, 'DELETE_COMPANY');
    if (!perm.allowed) return response(perm.message, 403);

    const company = await companyRepository.findCompanyById(companyId);
    if (!company) return response('Company not found', 404);

    await withTransaction((t) =>
      companyRepository.deactivateCompany(companyId, t)
    );

    sendNotification(actor?.id, {
      type: 'COMPANY_DEACTIVATED',
      title: 'Company Deactivated',
      message: `${company.name} has been deactivated.`,
      companyId,
    });

    sendAuditLog(buildAudit('COMPANY_DEACTIVATED', actor?.id, { companyId }));
    return ok({}, 'Company deactivated successfully');
  });

const uploadCompanyLogo = (companyId, fileBuffer, actor) =>
  safeExecute(async () => {
    const perm = assertPermission(actor, 'UPDATE_COMPANY');
    if (!perm.allowed) return response(perm.message, 403);

    assertCompanyAccess(actor, companyId);

    const company = await companyRepository.findCompanyById(companyId);
    if (!company) return response('Company not found', 404);

    const result = await uploadBuffer(fileBuffer, `hrms/company/${companyId}`);
    await companyRepository.updateLogo(companyId, {
      logoUrl: result.secure_url,
      logoPublicId: result.public_id,
    });

    if (company.logoPublicId) {
      cloudinary.uploader.destroy(company.logoPublicId).catch(() => { });
    }

    sendAuditLog(buildAudit('COMPANY_LOGO_UPDATED', actor?.id, { companyId }));
    return ok({ logoUrl: result.secure_url, width: result.width, height: result.height });
  });

const deleteCompanyLogo = (companyId, actor) =>
  safeExecute(async () => {
    const perm = assertPermission(actor, 'UPDATE_COMPANY');
    if (!perm.allowed) return response(perm.message, 403);

    const publicId = await companyRepository.getLogoPublicId(companyId);
    if (publicId) await cloudinary.uploader.destroy(publicId);

    await companyRepository.updateLogo(companyId, { logoUrl: null, logoPublicId: null });
    return ok({}, 'Logo deleted successfully');
  });

const getCompanySettings = (companyId, actor) =>
  safeExecute(async () => {
    assertCompanyAccess(actor, companyId);

    const settings = await companyRepository.findCompanySettings(companyId);
    if (!settings) return response('Company not found', 404);

    return ok({ settings });
  });

const updateCompanySettings = (companyId, settings, actor) =>
  safeExecute(async () => {
    const perm = assertPermission(actor, 'UPDATE_COMPANY');
    if (!perm.allowed) return response(perm.message, 403);

    assertCompanyAccess(actor, companyId);

    const allowed = [
      'workingHoursPerDay', 'workingDaysPerWeek', 'annualLeaveQuota',
      'timezone', 'currency', 'fiscalYearStart',
      'subscriptionPlan', 'subscriptionExpiresAt',
    ];

    const filtered = Object.fromEntries(
      Object.entries(settings).filter(([k]) => allowed.includes(k))
    );

    if (!Object.keys(filtered).length) {
      return response('No valid settings fields provided', 400);
    }

    await companyRepository.updateCompany(companyId, filtered);

    sendAuditLog(buildAudit('COMPANY_SETTINGS_UPDATED', actor?.id, {
      companyId, fields: Object.keys(filtered),
    }));

    return ok({ settings: filtered }, 'Settings updated successfully');
  });

const getCompanyUsers = (companyId, query, actor) =>
  safeExecute(async () => {
    const perm = assertPermission(actor, 'LIST_USERS');
    if (!perm.allowed) return response(perm.message, 403);

    assertCompanyAccess(actor, companyId);

    const result = await companyRepository.findCompanyUsers(companyId, {
      page: Number(query.page) || 1,
      limit: Number(query.limit) || 20,
      search: query.search || null,
      role: query.role || null,
    });

    return ok(result);
  });

const addUserToCompany = (companyId, userId, actor) =>
  safeExecute(async () => {
    const perm = assertPermission(actor, 'ADD_COMPANY_USER');
    if (!perm.allowed) return response(perm.message, 403);

    assertCompanyAccess(actor, companyId);

    const company = await companyRepository.findCompanyById(companyId);
    if (!company) return response('Company not found', 404);

    const user = await User.findByPk(userId);
    if (!user) return response('User not found', 404);

    if (user.companyId && Number(user.companyId) === Number(companyId)) {
      return response('User already belongs to this company', 409);
    }

    await withTransaction((t) =>
      companyRepository.assignUserToCompany(userId, companyId, t)
    );

    sendNotification(userId, {
      type: 'ADDED_TO_COMPANY',
      title: 'Welcome to the team',
      message: `You have been added to ${company.name}.`,
      companyId,
    });

    sendAuditLog(buildAudit('USER_ADDED_TO_COMPANY', actor?.id, { companyId, userId }));

    const updated = await User.findByPk(userId, {
      attributes: { exclude: ['passwordHash'] },
    });

    return ok({ user: updated }, 'User added to company successfully');
  });

const removeUserFromCompany = (companyId, userId, actor) =>
  safeExecute(async () => {
    const perm = assertPermission(actor, 'UPDATE_USER_ROLE');
    if (!perm.allowed) return response(perm.message, 403);

    assertCompanyAccess(actor, companyId);

    const user = await User.findOne({ where: { id: userId, companyId } });
    if (!user) return response('User not found in this company', 404);

    await withTransaction((t) =>
      companyRepository.removeUserFromCompany(userId, companyId, t)
    );

    sendNotification(userId, {
      type: 'REMOVED_FROM_COMPANY',
      title: 'Account deactivated',
      message: 'Your account has been removed from the company.',
      companyId,
    });

    sendAuditLog(buildAudit('USER_REMOVED_FROM_COMPANY', actor?.id, { companyId, userId }));
    return ok({}, 'User removed from company successfully');
  });

const updateUserRoleInCompany = (companyId, userId, roleId, actor) =>
  safeExecute(async () => {
    const perm = assertPermission(actor, 'UPDATE_USER');
    if (!perm.allowed) return response(perm.message, 403);

    assertCompanyAccess(actor, companyId);

    const user = await User.findOne({ where: { id: userId, companyId } });
    if (!user) return response('User not found in this company', 404);

    const role = await Role.findByPk(roleId);
    if (!role) return response('Role not found', 404);

    await withTransaction((t) =>
      companyRepository.updateUserRole(userId, companyId, roleId, t)
    );

    sendAuditLog(buildAudit('USER_ROLE_UPDATED', actor?.id, {
      companyId, userId, roleId, roleName: role.name,
    }));

    return ok({}, `User role updated to ${role.name}`);
  });

const getCompanyStats = (companyId, actor) =>
  safeExecute(async () => {
    const perm = assertPermission(actor, 'VIEW_DASHBOARD');
    if (!perm.allowed) return response(perm.message, 403);

    const [company, stats, employees, departments, leaveStats, payrollStats] = await Promise.all([
      companyRepository.findCompanyById(companyId),
      companyRepository.getCompanyStats(companyId),
      companyRepository.getEmployees(companyId),
      companyRepository.getDepartments(companyId),
      companyRepository.getLeaveStats(companyId),
      companyRepository.getPayrollStats(companyId),
    ]);

    if (!company) return response('Company not found', 404);

    return ok({
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        email: company.email,
        phone: company.phone,
        website: company.website,
        industry: company.industry,
        size: company.companySize,
        plan: company.subscriptionPlan,
        createdAt: company.createdAt,
      },
      stats,
      employees: { total: employees.length, list: employees },
      departments,
      leave: leaveStats,
      payroll: payrollStats,
    });
  });

const getCompanyDashboard = (companyId, query, actor) =>
  safeExecute(async () => {
    const perm = assertPermission(actor, 'VIEW_DASHBOARD');
    if (!perm.allowed) return response(perm.message, 403);

    assertCompanyAccess(actor, companyId);

    const company = await companyRepository.findCompanyById(companyId);
    if (!company) return response('Company not found', 404);

    const year = Number(query?.year) || new Date().getFullYear();
    const dashboard = await companyRepository.getCompanyDashboard(companyId, year);

    return ok({
      company: { id: company.id, name: company.name, plan: company.subscriptionPlan },
      year,
      dashboard,
    });
  });

const updateSubscription = (companyId, payload, actor) =>
  safeExecute(async () => {
    const perm = assertPermission(actor, 'UPDATE_COMPANY');
    if (!perm.allowed) return response(perm.message, 403);

    const validPlans = ['free', 'starter', 'pro', 'enterprise'];
    if (!validPlans.includes(payload.plan)) {
      return response(`Invalid plan. Must be one of: ${validPlans.join(', ')}`, 400);
    }

    const company = await companyRepository.findCompanyById(companyId);
    if (!company) return response('Company not found', 404);

    const updated = await withTransaction((t) =>
      companyRepository.updateSubscription(companyId, {
        plan: payload.plan,
        expiresAt: payload.expiresAt || null,
      }, t)
    );

    sendAuditLog(buildAudit('SUBSCRIPTION_UPDATED', actor?.id, {
      companyId, plan: payload.plan,
    }));

    return ok({
      subscriptionPlan: updated.subscriptionPlan,
      subscriptionExpiresAt: updated.subscriptionExpiresAt,
      status: checkSubscriptionStatus(updated),
    }, 'Subscription updated successfully');
  });

const getSubscriptionStatus = (companyId, actor) =>
  safeExecute(async () => {
    assertCompanyAccess(actor, companyId);

    const company = await companyRepository.findCompanyById(companyId, {
      attributes: ['id', 'subscriptionPlan', 'subscriptionExpiresAt'],
    });

    if (!company) return response('Company not found', 404);

    return ok({ status: checkSubscriptionStatus(company) });
  });

const sendCompanyWideNotification = (companyId, payload, actor) =>
  safeExecute(async () => {
    const perm = assertPermission(actor, 'UPDATE_COMPANY');
    if (!perm.allowed) return response(perm.message, 403);

    assertCompanyAccess(actor, companyId);

    if (!payload.title || !payload.message) {
      return response('title and message are required', 400);
    }

    const users = await User.findAll({
      where: { companyId, isActive: true },
      attributes: ['id'],
    });
    const userIds = users.map((u) => u.id);

    if (!userIds.length) return response('No active users in this company', 404);

    sendBulkNotifications(userIds, {
      type: payload.type || 'COMPANY_ANNOUNCEMENT',
      title: payload.title,
      message: payload.message,
      companyId,
      sentBy: actor.id,
    });

    sendAuditLog(buildAudit('COMPANY_NOTIFICATION_SENT', actor?.id, {
      companyId, recipients: userIds.length,
    }));

    return ok({ recipientCount: userIds.length }, 'Notification sent to all company users');
  });

const listCompanies = (query = {}, actor) =>
  safeExecute(async () => {
    const perm = assertPermission(actor, 'LIST_COMPANIES');
    if (!perm.allowed) return response(perm.message, 403);

    const result = await companyRepository.listCompanies({
      page: query.page,
      limit: query.limit,
      search: query.search,
      isActive: query.isActive,
      sortBy: query.sortBy,
      order: query.order,
      all: query.all,
    });

    return ok(result);
  });

module.exports = {
  createCompany,
  getCompany,
  updateCompany,
  deactivateCompany,
  reactivateCompany,
  listCompanies,
  getCompanySettings,
  updateCompanySettings,
  getCompanyUsers,
  addUserToCompany,
  removeUserFromCompany,
  updateUserRoleInCompany,
  uploadCompanyLogo,
  deleteCompanyLogo,
  getCompanyStats,
  getCompanyDashboard,
  updateSubscription,
  getSubscriptionStatus,
  sendCompanyWideNotification,
};