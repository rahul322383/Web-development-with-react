'use strict';

const router = require('express').Router();
const ctrl = require('./asset.controller');
const authenticate = require('../../middleware/authenticate');
const { requirePermission } = require('../../config/permissions');

router.use(authenticate);

// ─── Assets (inventory) ──────────────────────────────────────────────────────
router.post  ('/',     requirePermission('ASSIGN_ASSET'),        ctrl.createAsset);
router.get   ('/',     requirePermission('VIEW_ASSETS'),          ctrl.listAssets);
router.get   ('/mine', requirePermission('VIEW_ASSETS'),          ctrl.getMyAssets);  // employee's own assets
router.get   ('/:id',  requirePermission('VIEW_ASSETS'),          ctrl.getAsset);
router.patch ('/:id',  requirePermission('ASSIGN_ASSET'),         ctrl.updateAsset);
router.delete('/:id',  requirePermission('ASSIGN_ASSET'),         ctrl.deleteAsset);

// ─── Assignments ─────────────────────────────────────────────────────────────
router.post  ('/assignments',                         requirePermission('ASSIGN_ASSET'),   ctrl.assignAsset);
router.get   ('/assignments',                         requirePermission('VIEW_ASSETS'),    ctrl.listAssignments);
router.get   ('/assignments/:id',                     requirePermission('VIEW_ASSETS'),    ctrl.getAssignment);
router.patch ('/assignments/:assignmentId/return',    requirePermission('RETURN_ASSET'),   ctrl.returnAsset);

// ─── Damage Reports ──────────────────────────────────────────────────────────
router.post  ('/damage-reports',     requirePermission('FILE_DAMAGE_REPORT'),  ctrl.fileDamageReport);
router.get   ('/damage-reports',     requirePermission('VIEW_ASSET_REPORTS'),  ctrl.listDamageReports);
router.get   ('/damage-reports/:id', requirePermission('VIEW_ASSET_REPORTS'),  ctrl.getDamageReport);
router.patch ('/damage-reports/:id', requirePermission('VIEW_ASSET_REPORTS'),  ctrl.updateDamageReport);

module.exports = router;
