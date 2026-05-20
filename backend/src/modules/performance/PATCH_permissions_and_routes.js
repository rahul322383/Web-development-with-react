// ============================================================
// PATCH 1: Add to config/permissions.js  →  inside PERMISSIONS = { ... }
// ============================================================

// Performance Management
VIEW_KPI:               ['Admin', 'HR', 'Manager', 'Employee'],
MANAGE_KPI:             ['Admin', 'HR', 'Manager'],
VIEW_REVIEW_CYCLES:     ['Admin', 'HR', 'Manager', 'Employee'],
MANAGE_REVIEW_CYCLES:   ['Admin', 'HR'],
VIEW_REVIEWS:           ['Admin', 'HR', 'Manager', 'Employee'],
VIEW_ALL_REVIEWS:       ['Admin', 'HR'],
SUBMIT_SELF_APPRAISAL:  ['Employee', 'Manager', 'HR', 'Admin'],
SUBMIT_MGR_FEEDBACK:    ['Manager', 'HR', 'Admin'],
SUBMIT_360_REVIEW:      ['Employee', 'Manager', 'HR', 'Admin'],
ACKNOWLEDGE_REVIEW:     ['Employee', 'Manager'],
VIEW_PROMOTION_TRACK:   ['Admin', 'HR', 'Manager'],
MANAGE_PROMOTION:       ['Admin', 'HR'],

// Asset Management
VIEW_ASSETS:            ['Admin', 'HR', 'Manager', 'Employee'],
ASSIGN_ASSET:           ['Admin', 'HR'],
RETURN_ASSET:           ['Admin', 'HR', 'Manager'],
FILE_DAMAGE_REPORT:     ['Admin', 'HR', 'Manager', 'Employee'],
VIEW_ASSET_REPORTS:     ['Admin', 'HR', 'Manager'],


// ============================================================
// PATCH 2: Add to your main router file (e.g. routes/index.js)
// ============================================================

const performanceRoutes = require('../modules/performance/performance.routes');
const assetRoutes       = require('../modules/assets/asset.routes');

router.use('/performance', performanceRoutes);
router.use('/assets',      assetRoutes);
