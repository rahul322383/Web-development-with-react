// 'use strict';

// const companyService = require('./companyService');

// // mirrors your existing pattern — e.g. auditController, leaveController
// const respond = (res, result) => {
//   if (!result.success) {
//     return res.status(result.statusCode || 500).json({
//       success: false,
//       message: result.message || 'Something went wrong',
//     });
//   }
//   return res.status(200).json(result);
// };

// // ── POST /api/v1/company ─────────────────────────────────────
// const createCompany = async (req, res) => {
//   const result = await companyService.createCompany(req.body, req.user?.id);
//   return respond(res, result);
// };

// // ── GET /api/v1/company/:id ──────────────────────────────────
// const getCompany = async (req, res) => {
//   const result = await companyService.getCompany(req.params.id);
//   return respond(res, result);
// };

// // ── PATCH /api/v1/company/:id ────────────────────────────────
// const updateCompany = async (req, res) => {
//   const result = await companyService.updateCompany(req.params.id, req.body, req.user?.id);
//   return respond(res, result);
// };

// // ── POST /api/v1/company/:id/logo ────────────────────────────
// // expects multipart/form-data, field name: "logo"
// // upload.middleware.js passes the buffer via req.file.buffer
// const uploadLogo = async (req, res) => {
//   if (!req.file?.buffer) {
//     return res.status(400).json({ success: false, message: 'No file uploaded' });
//   }
//   const result = await companyService.uploadCompanyLogo(
//     req.params.id,
//     req.file.buffer,
//     req.user?.id
//   );
//   return respond(res, result);
// };

// // ── DELETE /api/v1/company/:id/logo ─────────────────────────
// const deleteLogo = async (req, res) => {
//   const result = await companyService.deleteCompanyLogo(req.params.id, req.user?.id);
//   return respond(res, result);
// };

// // ── PATCH /api/v1/company/:id/settings ──────────────────────
// const updateSettings = async (req, res) => {
//   const result = await companyService.updateCompanySettings(req.params.id, req.body, req.user?.id);
//   return respond(res, result);
// };

// // ── GET /api/v1/company/:id/stats ───────────────────────────
// const getStats = async (req, res) => {
//   const result = await companyService.getCompanyStats(req.params.id);
//   return respond(res, result);
// };

// // ── DELETE /api/v1/company/:id ───────────────────────────────
// const deactivateCompany = async (req, res) => {
//   const result = await companyService.deactivateCompany(req.params.id, req.user?.id);
//   return respond(res, result);
// };

// // ── GET /api/v1/company (super-admin) ───────────────────────
// const listCompanies = async (req, res) => {
//   const result = await companyService.listCompanies(req.query);
//   return respond(res, result);
// };

// module.exports = {
//   createCompany,
//   getCompany,
//   updateCompany,
//   uploadLogo,
//   deleteLogo,
//   updateSettings,
//   getStats,
//   deactivateCompany,
//   listCompanies,
// };


'use strict';

const companyService = require('./companyService');

// ─────────────────────────────────────────────────────────────
// CORE HELPERS
// ─────────────────────────────────────────────────────────────

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

const respond = (res, result) => {
  if (!result.success) {
    return res.status(result.statusCode || 500).json({
      success: false,
      message: result.message || 'Something went wrong',
    });
  }

  return res.status(200).json({
    success: true,
    message: result.message || '',
    data: result.data || {},
  });
};

const parseId = (id) => {
  const parsed = Number(id);
  if (!parsed || parsed <= 0) {
    throw new Error('Invalid ID');
  }
  return parsed;
};

// ─────────────────────────────────────────────────────────────
// CONTROLLERS
// ─────────────────────────────────────────────────────────────

// POST /company
const createCompany = asyncHandler(async (req, res) => {
  const result = await companyService.createCompany(req.body, req.user);
  return respond(res, result);
});

// GET /company/:id
const getCompany = asyncHandler(async (req, res) => {
  const companyId = parseId(req.params.id);

  const result = await companyService.getCompany(companyId, req.user);
  return respond(res, result);
});

// PATCH /company/:id
const updateCompany = asyncHandler(async (req, res) => {
  const companyId = parseId(req.params.id);

  const result = await companyService.updateCompany(
    companyId,
    req.body,
    req.user
  );

  return respond(res, result);
});

// POST /company/:id/logo
const uploadLogo = asyncHandler(async (req, res) => {
  const companyId = parseId(req.params.id);

  if (!req.file?.buffer) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
    });
  }

  // basic validation
  const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];

  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid file type',
    });
  }

  if (req.file.size > 2 * 1024 * 1024) {
    return res.status(400).json({
      success: false,
      message: 'File too large (max 2MB)',
    });
  }

  const result = await companyService.uploadCompanyLogo(
    companyId,
    req.file.buffer,
    req.user
  );

  return respond(res, result);
});

// DELETE /company/:id/logo
const deleteLogo = asyncHandler(async (req, res) => {
  const companyId = parseId(req.params.id);

  const result = await companyService.deleteCompanyLogo(
    companyId,
    req.user
  );

  return respond(res, result);
});

// PATCH /company/:id/settings
const updateSettings = asyncHandler(async (req, res) => {
  const companyId = parseId(req.params.id);

  const result = await companyService.updateCompanySettings(
    companyId,
    req.body,
    req.user
  );

  return respond(res, result);
});

// GET /company/:id/stats
const getStats = asyncHandler(async (req, res) => {
  const companyId = parseId(req.params.id);

  const result = await companyService.getCompanyStats(
    companyId,
    req.user
  );

  return respond(res, result);
});

// DELETE /company/:id
const deactivateCompany = asyncHandler(async (req, res) => {
  const companyId = parseId(req.params.id);

  const result = await companyService.deactivateCompany(
    companyId,
    req.user
  );

  return respond(res, result);
});

// GET /company
const listCompanies = asyncHandler(async (req, res) => {
  const result = await companyService.listCompanies(
    req.query,
    req.user
  );

  return respond(res, result);
});

// ─────────────────────────────────────────────────────────────

module.exports = {
  createCompany,
  getCompany,
  updateCompany,
  uploadLogo,
  deleteLogo,
  updateSettings,
  getStats,
  deactivateCompany,
  listCompanies,
};