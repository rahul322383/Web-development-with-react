'use strict';

const express  = require('express');
const router   = express.Router();
const multer   = require('multer');

const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/rbacMiddleware');

const {
  validateCreate,
  validateUpdate,
  validateSettings,
} = require('./companyValidation');

const {
  createCompany,
  getCompany,
  updateCompany,
  uploadLogo,
  deleteLogo,
  updateSettings,
  getStats,
  deactivateCompany,
  listCompanies,
} = require('./companyController');

// ── multer: memory storage so buffer goes straight to Cloudinary ──
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (allowed.includes(file.mimetype)) return cb(null, true);
    cb(new Error('Only JPEG, PNG, WEBP or SVG images are allowed'));
  },
});

// All routes require JWT
router.use(authenticate);

/**
 * GET  /api/v1/company           → list all companies (super-admin)
 * POST /api/v1/company           → create a new company
 */
router
  .route('/')
  .get(authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'), listCompanies)
  .post(authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'), validateCreate, createCompany);

/**
 * GET    /api/v1/company/:id     → get company profile
 * PATCH  /api/v1/company/:id     → update company profile
 * DELETE /api/v1/company/:id     → deactivate company (soft-delete)
 */
router
  .route('/:id')
  .get(getCompany)
  .patch(authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'), validateUpdate, updateCompany)
  .delete(authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'), deactivateCompany);

/**
 * POST   /api/v1/company/:id/logo   → upload / replace logo (multipart)
 * DELETE /api/v1/company/:id/logo   → remove logo from Cloudinary + DB
 */
router
  .route('/:id/logo')
  .post(authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'), upload.single('logo'), uploadLogo)
  .delete(authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'), deleteLogo);

/**
 * PATCH /api/v1/company/:id/settings
 * Update HR/payroll policy settings (working hours, leave quota, timezone…)
 */
router.patch(
  '/:id/settings',
  authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
  validateSettings,
  updateSettings,
);

/**
 * GET /api/v1/company/:id/stats
 * Returns headcount + payroll summary for dashboard KPIs
 */
router.get('/:id/stats', getStats);

module.exports = router;
