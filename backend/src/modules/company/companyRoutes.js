'use strict';

const express = require('express');
const router = express.Router();
const multer = require('multer');

const authenticate = require('../../middleware/auth.middleware');
const validate = require('../../middleware/validate.middleware');
const { apiLimiter, writeLimiter, strictLimiter } = require('../../middleware/rateLimit.middleware');
const { requirePermission } = require('../../utils/Permissions');

const {
  createCompanySchema,
  updateCompanySchema,
  updateSettingsSchema,
} = require('./companyValidation');

const {
  createCompany,
  getCompany,
  updateCompany,
  deactivateCompany,
  reactivateCompany,
  listCompanies,
  uploadLogo,
  deleteLogo,
  getSettings,
  updateSettings,
  getStats,
  getDashboard,
  getCompanyUsers,
  addUser,
  removeUser,
  updateUserRole,
  updateSubscription,
  getSubscriptionStatus,
  sendNotification,
} = require('./companyController');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Only JPEG, PNG, WEBP or SVG images are allowed'));
  },
});

router.use(authenticate, apiLimiter);

router.route('/')
  .get(strictLimiter, requirePermission('LIST_COMPANIES'), listCompanies)
  .post(writeLimiter, requirePermission('CREATE_COMPANY'), validate(createCompanySchema), createCompany);

router.route('/:id')
  .get(strictLimiter, requirePermission('VIEW_COMPANY'), getCompany)
  .patch(writeLimiter, requirePermission('UPDATE_COMPANY'), validate(updateCompanySchema), updateCompany)
  .delete(writeLimiter, requirePermission('DELETE_COMPANY'), deactivateCompany);

router.patch(
  '/:id/reactivate',
  writeLimiter,
  requirePermission('REACTIVATE_COMPANY'),
  reactivateCompany
);

router.route('/:id/logo')
  .post(writeLimiter, requirePermission('UPLOAD_COMPANY_LOGO'), upload.single('logo'), uploadLogo)
  .delete(writeLimiter, requirePermission('DELETE_COMPANY_LOGO'), deleteLogo);

router.route('/:id/settings')
  .get(strictLimiter, requirePermission('VIEW_COMPANY_SETTINGS'), getSettings)
  .patch(writeLimiter, requirePermission('UPDATE_COMPANY_SETTINGS'), validate(updateSettingsSchema), updateSettings);

router.get('/:id/stats', strictLimiter, requirePermission('VIEW_COMPANY_STATS'), getStats);

router.get('/:id/dashboard', strictLimiter, requirePermission('VIEW_COMPANY_DASHBOARD'), getDashboard);

router.route('/:id/users')
  .get(strictLimiter, requirePermission('VIEW_COMPANY_USERS'), getCompanyUsers)
  .post(writeLimiter, requirePermission('ADD_COMPANY_USER'), addUser);

router.route('/:id/users/:userId')
  .delete(writeLimiter, requirePermission('REMOVE_COMPANY_USER'), removeUser)
  .patch(writeLimiter, requirePermission('UPDATE_USER_ROLE'), updateUserRole);

router.route('/:id/subscription')
  .get(strictLimiter, requirePermission('VIEW_SUBSCRIPTION'), getSubscriptionStatus)
  .patch(writeLimiter, requirePermission('UPDATE_SUBSCRIPTION'), updateSubscription);

router.post('/:id/notify', writeLimiter, requirePermission('SEND_COMPANY_NOTIFICATION'), sendNotification);

module.exports = router;