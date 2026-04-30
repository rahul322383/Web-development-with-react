'use strict';

const companyService = require('./companyService');

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
  if (!parsed || parsed <= 0) throw new Error('Invalid ID');
  return parsed;
};

// ── existing handlers ─────────────────────────────────────────

const createCompany = asyncHandler(async (req, res) =>
  respond(res, await companyService.createCompany(req.body, req.user)));

const getCompany = asyncHandler(async (req, res) =>
  respond(res, await companyService.getCompany(parseId(req.params.id), req.user)));

const updateCompany = asyncHandler(async (req, res) =>
  respond(res, await companyService.updateCompany(parseId(req.params.id), req.body, req.user)));

const deactivateCompany = asyncHandler(async (req, res) =>
  respond(res, await companyService.deactivateCompany(parseId(req.params.id), req.user)));

const listCompanies = asyncHandler(async (req, res) =>
  respond(res, await companyService.listCompanies(req.query, req.user)));

const uploadLogo = asyncHandler(async (req, res) => {
  if (!req.file?.buffer) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  respond(res, await companyService.uploadCompanyLogo(parseId(req.params.id), req.file.buffer, req.user));
});

const deleteLogo = asyncHandler(async (req, res) =>
  respond(res, await companyService.deleteCompanyLogo(parseId(req.params.id), req.user)));

const updateSettings = asyncHandler(async (req, res) =>
  respond(res, await companyService.updateCompanySettings(parseId(req.params.id), req.body, req.user)));

const getStats = asyncHandler(async (req, res) =>
  respond(res, await companyService.getCompanyStats(parseId(req.params.id), req.user)));

// ── ✅ NEW handlers ───────────────────────────────────────────

const reactivateCompany = asyncHandler(async (req, res) =>
  respond(res, await companyService.reactivateCompany(parseId(req.params.id), req.user)));

const getSettings = asyncHandler(async (req, res) =>
  respond(res, await companyService.getCompanySettings(parseId(req.params.id), req.user)));

const getDashboard = asyncHandler(async (req, res) =>
  respond(res, await companyService.getCompanyDashboard(parseId(req.params.id), req.query, req.user)));

const getCompanyUsers = asyncHandler(async (req, res) =>
  respond(res, await companyService.getCompanyUsers(parseId(req.params.id), req.query, req.user)));

const addUser = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });
  respond(res, await companyService.addUserToCompany(parseId(req.params.id), Number(userId), req.user));
});

const removeUser = asyncHandler(async (req, res) =>
  respond(res, await companyService.removeUserFromCompany(
    parseId(req.params.id), parseId(req.params.userId), req.user
  )));

const updateUserRole = asyncHandler(async (req, res) => {
  const { roleId } = req.body;
  if (!roleId) return res.status(400).json({ success: false, message: 'roleId is required' });
  respond(res, await companyService.updateUserRoleInCompany(
    parseId(req.params.id), parseId(req.params.userId), Number(roleId), req.user
  ));
});

const updateSubscription = asyncHandler(async (req, res) =>
  respond(res, await companyService.updateSubscription(parseId(req.params.id), req.body, req.user)));

const getSubscriptionStatus = asyncHandler(async (req, res) =>
  respond(res, await companyService.getSubscriptionStatus(parseId(req.params.id), req.user)));

const sendNotification = asyncHandler(async (req, res) =>
  respond(res, await companyService.sendCompanyWideNotification(parseId(req.params.id), req.body, req.user)));

// ─────────────────────────────────────────────────────────────

module.exports = {
  createCompany,
  getCompany,
  updateCompany,
  deactivateCompany,
  reactivateCompany,        // ✅ NEW
  listCompanies,
  uploadLogo,
  deleteLogo,
  getSettings,              // ✅ NEW
  updateSettings,
  getStats,
  getDashboard,             // ✅ NEW
  getCompanyUsers,          // ✅ NEW
  addUser,                  // ✅ NEW
  removeUser,               // ✅ NEW
  updateUserRole,           // ✅ NEW
  updateSubscription,       // ✅ NEW
  getSubscriptionStatus,    // ✅ NEW
  sendNotification,         // ✅ NEW
};