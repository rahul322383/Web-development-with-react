// 'use strict';

// const express = require('express');
// const router = express.Router();
// const multer = require('multer');

// const validate = require('../../middleware/validate.middleware');
// const authenticate = require('../../middleware/auth.middleware');
// const authorize = require('../../middleware/rbacMiddleware');

// // ✅ import schemas (NOT wrapped validators)
// const {
//   createCompanySchema,
//   updateCompanySchema,
//   updateSettingsSchema,
// } = require('./companyValidation');

// const {
//   createCompany, getCompany, updateCompany,
//   deactivateCompany, reactivateCompany, listCompanies,
//   uploadLogo, deleteLogo,
//   getSettings, updateSettings,
//   getStats, getDashboard,
//   getCompanyUsers, addUser, removeUser, updateUserRole,
//   updateSubscription, getSubscriptionStatus,
//   sendNotification,
// } = require('./companyController');

// // ── Multer config ─────────────────────────────────────────────
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: { fileSize: 2 * 1024 * 1024 },
//   fileFilter: (_req, file, cb) => {
//     const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
//     if (allowed.includes(file.mimetype)) return cb(null, true);
//     cb(new Error('Only JPEG, PNG, WEBP or SVG images are allowed'));
//   },
// });

// // ── Global Auth ───────────────────────────────────────────────
// router.use(authenticate);

// // ── Collection ────────────────────────────────────────────────
// router.route('/')
//   .get(
//     authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
//     listCompanies
//   )
//   .post(
//     authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
//     validate(createCompanySchema), // ✅ direct schema usage
//     createCompany
//   );

// // ── Single company ────────────────────────────────────────────
// router.route('/:id')
//   .get(getCompany)
//   .patch(
//     authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
//     validate(updateCompanySchema),
//     updateCompany
//   )
//   .delete(
//     authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
//     deactivateCompany
//   );

// // ── Reactivate ────────────────────────────────────────────────
// router.patch(
//   '/:id/reactivate',
//   authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
//   reactivateCompany
// );

// // ── Logo ──────────────────────────────────────────────────────
// router.route('/:id/logo')
//   .post(
//     authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
//     upload.single('logo'),
//     uploadLogo
//   )
//   .delete(
//     authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
//     deleteLogo
//   );

// // ── Settings ──────────────────────────────────────────────────
// router.route('/:id/settings')
//   .get(
//     authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
//     getSettings
//   )
//   .patch(
//     authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
//     validate(updateSettingsSchema),
//     updateSettings
//   );

// // ── Stats + Dashboard ─────────────────────────────────────────
// router.get(
//   '/:id/stats',
//   authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
//   getStats
// );

// router.get(
//   '/:id/dashboard',
//   authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
//   getDashboard
// );

// // ── Users ─────────────────────────────────────────────────────
// router.route('/:id/users')
//   .get(
//     authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
//     getCompanyUsers
//   )
//   .post(
//     authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
//     addUser
//   );

// router.route('/:id/users/:userId')
//   .delete(
//     authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
//     removeUser
//   )
//   .patch(
//     authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
//     updateUserRole
//   );

// // ── Subscription ──────────────────────────────────────────────
// router.route('/:id/subscription')
//   .get(getSubscriptionStatus)
//   .patch(
//     authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
//     updateSubscription
//   );

// // ── Notifications ─────────────────────────────────────────────
// router.post(
//   '/:id/notify',
//   authorize('Employee', 'Manager', 'HR', 'Finance', 'Admin'),
//   sendNotification
// );

// module.exports = router;
'use strict';
const { requirePermission } = require('../../utils/Permissions'); // adjust path


const express = require('express');
const router = express.Router();
const multer = require('multer');

const validate = require('../../middleware/validate.middleware');
const authenticate = require('../../middleware/auth.middleware');
const authorize = require('../../middleware/rbacMiddleware');

// ✅ import schemas (NOT wrapped validators)
const {
  createCompanySchema,
  updateCompanySchema,
  updateSettingsSchema,
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

// ── Multer config ─────────────────────────────────────────────
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
  .get(
    requirePermission('LIST_COMPANIES'),
    listCompanies
  )
  .post(
    requirePermission('CREATE_COMPANY'),
    validate(createCompanySchema),
    createCompany
  );

// ── Single company ────────────────────────────────────────────
router.route('/:id')
  .get(
    requirePermission('VIEW_COMPANY'),
    getCompany
  )
  .patch(
    requirePermission('UPDATE_COMPANY'),
    validate(updateCompanySchema),
    updateCompany
  )
  .delete(
    requirePermission('DELETE_COMPANY'),
    deactivateCompany
  );

// ── Reactivate ────────────────────────────────────────────────
router.patch(
  '/:id/reactivate',
  requirePermission('REACTIVATE_COMPANY'),
  reactivateCompany
);

// ── Logo ──────────────────────────────────────────────────────
router.route('/:id/logo')
  .post(
    requirePermission('UPLOAD_COMPANY_LOGO'),
    upload.single('logo'),
    uploadLogo
  )
  .delete(
    requirePermission('DELETE_COMPANY_LOGO'),
    deleteLogo
  );

// ── Settings ──────────────────────────────────────────────────
router.route('/:id/settings')
  .get(
    requirePermission('VIEW_COMPANY_SETTINGS'),
    getSettings
  )
  .patch(
    requirePermission('UPDATE_COMPANY_SETTINGS'),
    validate(updateSettingsSchema),
    updateSettings
  );

// ── Stats + Dashboard ─────────────────────────────────────────
router.get(
  '/:id/stats',
  requirePermission('VIEW_COMPANY_STATS'),
  getStats
);

router.get(
  '/:id/dashboard',
  requirePermission('VIEW_COMPANY_DASHBOARD'),
  getDashboard
);

// ── Users ─────────────────────────────────────────────────────
router.route('/:id/users')
  .get(
    requirePermission('VIEW_COMPANY_USERS'),
    getCompanyUsers
  )
  .post(
    requirePermission('ADD_COMPANY_USER'),
    addUser
  );

router.route('/:id/users/:userId')
  .delete(
    requirePermission('REMOVE_COMPANY_USER'),
    removeUser
  )
  .patch(
    requirePermission('UPDATE_USER_ROLE'),
    updateUserRole
  );

// ── Subscription ──────────────────────────────────────────────
router.route('/:id/subscription')
  .get(
    requirePermission('VIEW_SUBSCRIPTION'),
    getSubscriptionStatus
  )
  .patch(
    requirePermission('UPDATE_SUBSCRIPTION'),
    updateSubscription
  );

// ── Notifications ─────────────────────────────────────────────
router.post(
  '/:id/notify',
  requirePermission('SEND_COMPANY_NOTIFICATION'),
  sendNotification
);

module.exports = router;