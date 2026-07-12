import { Router } from 'express';
import * as maintenanceController from './maintenance.controller.js';
import { 
  createMaintenanceSchema, 
  updateMaintenanceSchema, 
  getMaintenanceSchema, 
  listMaintenanceSchema 
} from './maintenance.validation.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { auditLogger } from '../middleware/audit.middleware.js';

const router = Router();

// Retrieve all maintenance logs (Admin, Fleet Manager roles)
router.get(
  '/',
  authenticate,
  authorize('ADMIN', 'FLEET_MANAGER'),
  validate(listMaintenanceSchema),
  maintenanceController.list
);

// Retrieve details for a single log (Admin, Fleet Manager roles)
router.get(
  '/:id',
  authenticate,
  authorize('ADMIN', 'FLEET_MANAGER'),
  validate(getMaintenanceSchema),
  maintenanceController.getOne
);

// Schedule a new maintenance log (Admin, Fleet Manager roles)
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'FLEET_MANAGER'),
  validate(createMaintenanceSchema),
  auditLogger('Schedule Maintenance Operations', 'MaintenanceLog'),
  maintenanceController.create
);

// Update a maintenance log details (Admin, Fleet Manager roles)
router.patch(
  '/:id',
  authenticate,
  authorize('ADMIN', 'FLEET_MANAGER'),
  validate(updateMaintenanceSchema),
  auditLogger('Modify Maintenance Details', 'MaintenanceLog'),
  maintenanceController.update
);

// Start maintenance (Admin, Fleet Manager roles)
router.post(
  '/:id/start',
  authenticate,
  authorize('ADMIN', 'FLEET_MANAGER'),
  validate(getMaintenanceSchema),
  auditLogger('Start Maintenance Operations', 'MaintenanceLog'),
  maintenanceController.start
);

// Complete maintenance (Admin, Fleet Manager roles)
router.post(
  '/:id/complete',
  authenticate,
  authorize('ADMIN', 'FLEET_MANAGER'),
  validate(getMaintenanceSchema),
  auditLogger('Complete Maintenance Operations', 'MaintenanceLog'),
  maintenanceController.complete
);

// Delete maintenance log (Admin, Fleet Manager roles)
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN', 'FLEET_MANAGER'),
  validate(getMaintenanceSchema),
  auditLogger('Delete Maintenance Log', 'MaintenanceLog'),
  maintenanceController.remove
);

export default router;
