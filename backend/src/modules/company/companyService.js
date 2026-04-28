// 'use strict';

// const sequelize        = require('../../database/sequelize');
// const logger           = require('../../config/logger');
// const { cloudinary, uploadBuffer } = require('../../config/cloudinary');
// const companyRepository = require('./companyRepository');
// const { sendNotification, sendAuditLog } = require('../../config/socket');

// // ─────────────────────────────────────────────────────────────
// //  HELPERS
// // ─────────────────────────────────────────────────────────────

// /** Convert "Acme Corp Ltd." → "acme-corp-ltd" */
// const toSlug = (name) =>
//   name
//     .toLowerCase()
//     .trim()
//     .replace(/[^a-z0-9]+/g, '-')
//     .replace(/^-+|-+$/g, '');

// /** Make slug unique by appending timestamp if taken */
// const uniqueSlug = async (name) => {
//   const base = toSlug(name);
//   const existing = await companyRepository.findCompanyBySlug(base);
//   return existing ? `${base}-${Date.now()}` : base;
// };

// const buildAudit = (event, userId, meta = {}) => ({
//   event, userId, metadata: meta, timestamp: new Date().toISOString(),
// });

// // ─────────────────────────────────────────────────────────────
// //  1. CREATE COMPANY  (onboarding flow)
// //     Creates company + seeds default settings atomically
// // ─────────────────────────────────────────────────────────────

// const createCompany = async (payload, actorId = null) => {
//   try {
//     const existing = await companyRepository.findCompanyByName(payload.name);
//     if (existing) {
//       return { success: false, message: 'Company name already registered', statusCode: 409 };
//     }

//     const slug = await uniqueSlug(payload.name);

//     const company = await sequelize.transaction(async (t) => {
//       return companyRepository.createCompany({
//         name:               payload.name,
//         slug,
//         email:              payload.email              ?? null,
//         phone:              payload.phone              ?? null,
//         website:            payload.website            ?? null,
//         industry:           payload.industry           ?? null,
//         size:               payload.size               ?? null,
//         addressLine1:       payload.addressLine1       ?? null,
//         addressLine2:       payload.addressLine2       ?? null,
//         city:               payload.city               ?? null,
//         state:              payload.state              ?? null,
//         country:            payload.country            ?? 'India',
//         postalCode:         payload.postalCode         ?? null,
//         timezone:           payload.timezone           ?? 'Asia/Kolkata',
//         currency:           payload.currency           ?? 'INR',
//         workingHoursPerDay: payload.workingHoursPerDay ?? 8,
//         workingDaysPerWeek: payload.workingDaysPerWeek ?? 5,
//         annualLeaveQuota:   payload.annualLeaveQuota   ?? 21,
//         fiscalYearStart:    payload.fiscalYearStart    ?? 4,
//         subscriptionPlan:   payload.subscriptionPlan   ?? 'free',
//       }, t);
//     });

//     sendAuditLog(buildAudit('COMPANY_CREATED', actorId, { companyId: company.id, name: company.name }));

//     return { success: true, data: { company } };

//   } catch (error) {
//     logger.error({ event: 'COMPANY_CREATE_FAILED', error: error.message, stack: error.stack });
//     return { success: false, message: error.message || 'Failed to create company', statusCode: 500 };
//   }
// };

// // ─────────────────────────────────────────────────────────────
// //  2. GET COMPANY
// // ─────────────────────────────────────────────────────────────

// const getCompany = async (companyId) => {
//   try {
//     const company = await companyRepository.findCompanyById(companyId);
//     if (!company) return { success: false, message: 'Company not found', statusCode: 404 };
//     return { success: true, data: { company } };
//   } catch (error) {
//     logger.error({ event: 'COMPANY_GET_FAILED', error: error.message });
//     return { success: false, message: 'Failed to fetch company', statusCode: 500 };
//   }
// };

// // ─────────────────────────────────────────────────────────────
// //  3. UPDATE COMPANY PROFILE
// // ─────────────────────────────────────────────────────────────

// const updateCompany = async (companyId, payload, actorId = null) => {
//   try {
//     const company = await companyRepository.findCompanyById(companyId);
//     if (!company) return { success: false, message: 'Company not found', statusCode: 404 };

//     // prevent slug/logo being changed via this endpoint
//     const { logoUrl, logoPublicId, slug, ...safePayload } = payload;

//     await companyRepository.updateCompany(companyId, safePayload);

//     const updated = await companyRepository.findCompanyById(companyId);

//     sendAuditLog(buildAudit('COMPANY_UPDATED', actorId, { companyId, fields: Object.keys(safePayload) }));

//     return { success: true, data: { company: updated } };

//   } catch (error) {
//     logger.error({ event: 'COMPANY_UPDATE_FAILED', error: error.message });
//     return { success: false, message: 'Failed to update company', statusCode: 500 };
//   }
// };

// // ─────────────────────────────────────────────────────────────
// //  4. UPLOAD / REPLACE COMPANY LOGO  (Cloudinary)
// //     - Deletes old logo from Cloudinary before uploading new
// //     - Stores public_id for future deletion
// // ─────────────────────────────────────────────────────────────

// const uploadCompanyLogo = async (companyId, fileBuffer, actorId = null) => {
//   try {
//     const company = await companyRepository.findCompanyById(companyId);
//     if (!company) return { success: false, message: 'Company not found', statusCode: 404 };

//     // delete old logo from Cloudinary if it exists
//     if (company.logoPublicId) {
//       try {
//         await cloudinary.uploader.destroy(company.logoPublicId);
//       } catch (err) {
//         // non-fatal — log and continue
//         logger.warn({ event: 'CLOUDINARY_DELETE_WARN', publicId: company.logoPublicId, error: err.message });
//       }
//     }

//     // upload new logo
//     const result = await uploadBuffer(fileBuffer, `hrms/company-logos/${companyId}`);

//     const updated = await companyRepository.updateLogo(companyId, {
//       logoUrl:      result.secure_url,
//       logoPublicId: result.public_id,
//     });

//     sendAuditLog(buildAudit('COMPANY_LOGO_UPDATED', actorId, {
//       companyId,
//       publicId: result.public_id,
//       url:      result.secure_url,
//     }));

//     return {
//       success: true,
//       data: {
//         logoUrl:      result.secure_url,
//         logoPublicId: result.public_id,
//         width:        result.width,
//         height:       result.height,
//         format:       result.format,
//         bytes:        result.bytes,
//       },
//     };

//   } catch (error) {
//     logger.error({ event: 'COMPANY_LOGO_UPLOAD_FAILED', error: error.message, stack: error.stack });
//     return { success: false, message: 'Logo upload failed', statusCode: 500 };
//   }
// };

// // ─────────────────────────────────────────────────────────────
// //  5. DELETE COMPANY LOGO
// // ─────────────────────────────────────────────────────────────

// const deleteCompanyLogo = async (companyId, actorId = null) => {
//   try {
//     const publicId = await companyRepository.getLogoPublicId(companyId);

//     if (publicId) {
//       await cloudinary.uploader.destroy(publicId);
//     }

//     await companyRepository.updateLogo(companyId, { logoUrl: null, logoPublicId: null });

//     sendAuditLog(buildAudit('COMPANY_LOGO_DELETED', actorId, { companyId }));

//     return { success: true, message: 'Logo removed successfully' };

//   } catch (error) {
//     logger.error({ event: 'COMPANY_LOGO_DELETE_FAILED', error: error.message });
//     return { success: false, message: 'Failed to delete logo', statusCode: 500 };
//   }
// };

// // ─────────────────────────────────────────────────────────────
// //  6. COMPANY SETTINGS  (HR policy update)
// // ─────────────────────────────────────────────────────────────

// const updateCompanySettings = async (companyId, settings, actorId = null) => {
//   try {
//     const allowed = [
//       'workingHoursPerDay',
//       'workingDaysPerWeek',
//       'annualLeaveQuota',
//       'timezone',
//       'currency',
//       'fiscalYearStart',
//       'subscriptionPlan',
//       'subscriptionExpiresAt',
//     ];

//     const filtered = Object.fromEntries(
//       Object.entries(settings).filter(([k]) => allowed.includes(k))
//     );

//     if (Object.keys(filtered).length === 0) {
//       return { success: false, message: 'No valid settings fields provided', statusCode: 400 };
//     }

//     await companyRepository.updateCompany(companyId, filtered);
//     const updated = await companyRepository.findCompanyById(companyId);

//     sendAuditLog(buildAudit('COMPANY_SETTINGS_UPDATED', actorId, { companyId, fields: Object.keys(filtered) }));

//     return { success: true, data: { settings: updated } };

//   } catch (error) {
//     logger.error({ event: 'COMPANY_SETTINGS_FAILED', error: error.message });
//     return { success: false, message: 'Failed to update settings', statusCode: 500 };
//   }
// };

// // ─────────────────────────────────────────────────────────────
// //  7. DASHBOARD STATS SUMMARY
// // ─────────────────────────────────────────────────────────────

// const getCompanyStats = async (companyId) => {
//   try {
//     const [company, stats] = await Promise.all([
//       companyRepository.findCompanyById(companyId),
//       companyRepository.getCompanyStats(companyId),
//     ]);

//     if (!company) return { success: false, message: 'Company not found', statusCode: 404 };

//     return {
//       success: true,
//       data: {
//         company: {
//           id:               company.id,
//           name:             company.name,
//           logoUrl:          company.logoUrl,
//           subscriptionPlan: company.subscriptionPlan,
//           isVerified:       company.isVerified,
//         },
//         stats,
//       },
//     };

//   } catch (error) {
//     logger.error({ event: 'COMPANY_STATS_FAILED', error: error.message });
//     return { success: false, message: 'Failed to fetch company stats', statusCode: 500 };
//   }
// };

// // ─────────────────────────────────────────────────────────────
// //  8. DEACTIVATE COMPANY  (soft-delete + lock all users)
// // ─────────────────────────────────────────────────────────────

// const deactivateCompany = async (companyId, actorId = null) => {
//   try {
//     const company = await companyRepository.findCompanyById(companyId);
//     if (!company) return { success: false, message: 'Company not found', statusCode: 404 };

//     await sequelize.transaction(async (t) => {
//       await companyRepository.deactivateCompany(companyId, t);
//     });

//     sendNotification(actorId, { event: 'COMPANY_DEACTIVATED', companyId });
//     sendAuditLog(buildAudit('COMPANY_DEACTIVATED', actorId, { companyId, name: company.name }));

//     return { success: true, message: 'Company deactivated successfully' };

//   } catch (error) {
//     logger.error({ event: 'COMPANY_DEACTIVATE_FAILED', error: error.message });
//     return { success: false, message: 'Failed to deactivate company', statusCode: 500 };
//   }
// };

// // ─────────────────────────────────────────────────────────────
// //  9. LIST COMPANIES  (super-admin)
// // ─────────────────────────────────────────────────────────────

// const listCompanies = async (query = {}) => {
//   try {
//     const page     = parseInt(query.page,  10) || 1;
//     const limit    = parseInt(query.limit, 10) || 20;
//     const search   = query.search   || null;
//     const isActive = query.isActive !== undefined ? query.isActive === 'true' : undefined;

//     const result = await companyRepository.listCompanies({ page, limit, search, isActive });
//     return { success: true, data: result };

//   } catch (error) {
//     logger.error({ event: 'COMPANY_LIST_FAILED', error: error.message });
//     return { success: false, message: 'Failed to list companies', statusCode: 500 };
//   }
// };

// module.exports = {
//   createCompany,
//   getCompany,
//   updateCompany,
//   uploadCompanyLogo,
//   deleteCompanyLogo,
//   updateCompanySettings,
//   getCompanyStats,
//   deactivateCompany,
//   listCompanies,
// };

'use strict';

const sequelize = require('../../database/sequelize');
const logger = require('../../config/logger');
const { cloudinary, uploadBuffer } = require('../../config/cloudinary');
const companyRepository = require('./companyRepository');
const { sendNotification, sendAuditLog } = require('../../config/socket');

// ─────────────────────────────────────────────────────────────
// CORE UTILITIES
// ─────────────────────────────────────────────────────────────

class ServiceError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
  }
}

const ok = (data = {}, message = '') => ({
  success: true,
  message,
  data,
});

const fail = (message, statusCode = 500) => ({
  success: false,
  message,
  statusCode,
});

const safeExecute = async (fn, label) => {
  try {
    return await fn();
  } catch (err) {
    logger.error({ event: label, message: err.message, stack: err.stack });
    return fail(err.message || 'Internal error', err.statusCode || 500);
  }
};

const withTransaction = (fn) => {
  return sequelize.transaction(async (t) => fn(t));
};

// ─────────────────────────────────────────────────────────────
// SECURITY (RBAC HOOK)
// ─────────────────────────────────────────────────────────────

const assertPermission = (actor, action, resourceCompanyId) => {
  // plug your RBAC here later
  if (!actor) throw new ServiceError('Unauthorized', 401);
  return true;
};

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const toSlug = (name) =>
  name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

const generateUniqueSlug = async (name) => {
  const base = toSlug(name);
  let slug = base;
  let counter = 1;

  while (await companyRepository.findCompanyBySlug(slug)) {
    slug = `${base}-${counter++}`;
  }

  return slug;
};

const buildAudit = (event, userId, meta = {}) => ({
  event,
  userId,
  metadata: meta,
  timestamp: new Date().toISOString(),
});

// ─────────────────────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────────────────────

const validateCompanyPayload = (payload) => {
  if (!payload.name) throw new ServiceError('Company name is required', 400);

  if (payload.workingHoursPerDay > 24) {
    throw new ServiceError('Invalid working hours per day', 400);
  }

  if (payload.workingDaysPerWeek > 7) {
    throw new ServiceError('Invalid working days per week', 400);
  }
};

// ─────────────────────────────────────────────────────────────
// SERVICE METHODS
// ─────────────────────────────────────────────────────────────

const createCompany = (payload, actor) =>
  safeExecute(async () => {
    assertPermission(actor, 'CREATE_COMPANY');

    validateCompanyPayload(payload);

    const existing = await companyRepository.findCompanyByName(payload.name);
    if (existing) throw new ServiceError('Company already exists', 409);

    const slug = await generateUniqueSlug(payload.name);

    const company = await withTransaction(async (t) => {
      return companyRepository.createCompany(
        {
          ...payload,
          slug,
          country: payload.country ?? 'India',
          timezone: payload.timezone ?? 'Asia/Kolkata',
          currency: payload.currency ?? 'INR',
          workingHoursPerDay: payload.workingHoursPerDay ?? 8,
          workingDaysPerWeek: payload.workingDaysPerWeek ?? 5,
        },
        t
      );
    });

    sendAuditLog(buildAudit('COMPANY_CREATED', actor?.id, { companyId: company.id }));

    return ok({ company });
  }, 'COMPANY_CREATE_FAILED');

const getCompany = (companyId, actor) =>
  safeExecute(async () => {
    assertPermission(actor, 'READ_COMPANY', companyId);

    const company = await companyRepository.findCompanyById(companyId);
    if (!company || !company.isActive) throw new ServiceError('Company not found', 404);

    return ok({ company });
  }, 'COMPANY_GET_FAILED');

const updateCompany = (companyId, payload, actor) =>
  safeExecute(async () => {
    assertPermission(actor, 'UPDATE_COMPANY', companyId);

    const company = await companyRepository.findCompanyById(companyId);
    if (!company) throw new ServiceError('Company not found', 404);

    const { slug, logoUrl, logoPublicId, ...safePayload } = payload;

    await withTransaction(async (t) => {
      await companyRepository.updateCompany(companyId, safePayload, t);
    });

    const updated = await companyRepository.findCompanyById(companyId);

    sendAuditLog(
      buildAudit('COMPANY_UPDATED', actor?.id, {
        companyId,
        fields: Object.keys(safePayload),
      })
    );

    return ok({ company: updated });
  }, 'COMPANY_UPDATE_FAILED');

const uploadCompanyLogo = (companyId, fileBuffer, actor) =>
  safeExecute(async () => {
    assertPermission(actor, 'UPDATE_COMPANY', companyId);

    const company = await companyRepository.findCompanyById(companyId);
    if (!company) throw new ServiceError('Company not found', 404);

    // 1. upload new FIRST (safe)
    const result = await uploadBuffer(fileBuffer, `hrms/company/${companyId}`);

    // 2. update DB
    await companyRepository.updateLogo(companyId, {
      logoUrl: result.secure_url,
      logoPublicId: result.public_id,
    });

    // 3. delete old AFTER success
    if (company.logoPublicId) {
      cloudinary.uploader.destroy(company.logoPublicId).catch(() => { });
    }

    sendAuditLog(
      buildAudit('COMPANY_LOGO_UPDATED', actor?.id, {
        companyId,
      })
    );

    return ok({
      logoUrl: result.secure_url,
      width: result.width,
      height: result.height,
    });
  }, 'LOGO_UPLOAD_FAILED');

const deleteCompanyLogo = (companyId, actor) =>
  safeExecute(async () => {
    assertPermission(actor, 'UPDATE_COMPANY', companyId);

    const publicId = await companyRepository.getLogoPublicId(companyId);

    if (publicId) {
      await cloudinary.uploader.destroy(publicId);
    }

    await companyRepository.updateLogo(companyId, {
      logoUrl: null,
      logoPublicId: null,
    });

    return ok({}, 'Logo deleted');
  }, 'LOGO_DELETE_FAILED');

const updateCompanySettings = (companyId, settings, actor) =>
  safeExecute(async () => {
    assertPermission(actor, 'UPDATE_SETTINGS', companyId);

    const allowed = [
      'workingHoursPerDay',
      'workingDaysPerWeek',
      'annualLeaveQuota',
      'timezone',
      'currency',
      'subscriptionPlan',
    ];

    const filtered = Object.fromEntries(
      Object.entries(settings).filter(([k]) => allowed.includes(k))
    );

    if (!Object.keys(filtered).length) {
      throw new ServiceError('No valid fields', 400);
    }

    await companyRepository.updateCompany(companyId, filtered);

    return ok({ settings: filtered });
  }, 'SETTINGS_UPDATE_FAILED');

const getCompanyStats = (companyId, actor) =>
  safeExecute(async () => {
    assertPermission(actor, 'READ_STATS', companyId);

    const [company, stats] = await Promise.all([
      companyRepository.findCompanyById(companyId),
      companyRepository.getCompanyStats(companyId),
    ]);

    if (!company) throw new ServiceError('Company not found', 404);

    return ok({
      company: {
        id: company.id,
        name: company.name,
        plan: company.subscriptionPlan,
      },
      stats,
    });
  }, 'STATS_FAILED');

const deactivateCompany = (companyId, actor) =>
  safeExecute(async () => {
    assertPermission(actor, 'DEACTIVATE_COMPANY', companyId);

    await withTransaction(async (t) => {
      await companyRepository.deactivateCompany(companyId, t);
    });

    sendNotification(actor?.id, { event: 'COMPANY_DEACTIVATED', companyId });

    return ok({}, 'Company deactivated');
  }, 'DEACTIVATE_FAILED');

const listCompanies = (query = {}, actor) =>
  safeExecute(async () => {
    assertPermission(actor, 'LIST_COMPANIES');

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;

    const result = await companyRepository.listCompanies({
      page,
      limit,
      search: query.search || null,
    });

    return ok(result);
  }, 'LIST_FAILED');

// ─────────────────────────────────────────────────────────────

module.exports = {
  createCompany,
  getCompany,
  updateCompany,
  uploadCompanyLogo,
  deleteCompanyLogo,
  updateCompanySettings,
  getCompanyStats,
  deactivateCompany,
  listCompanies,
};