'use strict';

const express = require('express');
const router = express.Router();
const multer = require('multer');

const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/rbacMiddleware');
const {
  validateCreate, validateUpdate, validateSettings,
} = require('./companyValidation');

const {
  createCompany, getCompany, updateCompany,
  deactivateCompany, reactivateCompany, listCompanies,
  uploadLogo, deleteLogo,
  getSettings, updateSettings,
  getStats, getDashboard,
  getCompanyUsers, addUser, removeUser, updateUserRole,
  updateSubscription, getSubscriptionStatus,
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

router.use(authenticate);

// ── Collection ────────────────────────────────────────────────
router.route('/')
  .get(authorize('Admin'), listCompanies)
  .post(authorize('Admin'), validateCreate, createCompany);

// ── Single company ────────────────────────────────────────────
router.route('/:id')
  .get(getCompany)
  .patch(authorize('Admin'), validateUpdate, updateCompany)
  .delete(authorize('Admin'), deactivateCompany);

// ── Reactivate ────────────────────────────────────────────────
router.patch('/:id/reactivate',
  authorize('Admin'), reactivateCompany);

// ── Logo ──────────────────────────────────────────────────────
router.route('/:id/logo')
  .post(authorize('Admin', 'HR'), upload.single('logo'), uploadLogo)
  .delete(authorize('Admin'), deleteLogo);

// ── Settings ──────────────────────────────────────────────────
router.route('/:id/settings')
  .get(authorize('Admin', 'HR'), getSettings)
  .patch(authorize('Admin'), validateSettings, updateSettings);

// ── Stats + Dashboard ─────────────────────────────────────────
router.get('/:id/stats',
  authorize('Admin', 'HR'), getStats);

router.get('/:id/dashboard',
  authorize('Admin', 'HR'), getDashboard);

// ── Users ─────────────────────────────────────────────────────
router.route('/:id/users')
  .get(authorize('Admin', 'HR'), getCompanyUsers)
  .post(authorize('Admin', 'HR'), addUser);

router.route('/:id/users/:userId')
  .delete(authorize('Admin'), removeUser)
  .patch(authorize('Admin'), updateUserRole);

// ── Subscription ──────────────────────────────────────────────
router.route('/:id/subscription')
  .get(getSubscriptionStatus)
  .patch(authorize('Admin'), updateSubscription);

// ── Notifications ─────────────────────────────────────────────
router.post('/:id/notify',
  authorize('Admin', 'HR'), sendNotification);

module.exports = router;