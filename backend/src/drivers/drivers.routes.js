import { Router } from 'express';
import * as driversController from './drivers.controller.js';
import { 
  createDriverSchema, 
  updateDriverSchema, 
  getDriverSchema, 
  listDriversSchema 
} from './drivers.validation.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { auditLogger } from '../middleware/audit.middleware.js';

const router = Router();

// Retrieve all drivers with filters (All auth users)
router.get(
  '/',
  authenticate,
  validate(listDriversSchema),
  driversController.list
);

// Retrieve details for a single driver (All auth users)
router.get(
  '/:id',
  authenticate,
  validate(getDriverSchema),
  driversController.getOne
);

// Register a new driver (Admin, Fleet Manager, Safety Officer)
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'FLEET_MANAGER', 'SAFETY_OFFICER'),
  validate(createDriverSchema),
  auditLogger('Register Driver Profile', 'Driver'),
  driversController.create
);

// Update details of a driver (Admin, Fleet Manager, Safety Officer)
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'FLEET_MANAGER', 'SAFETY_OFFICER'),
  validate(updateDriverSchema),
  auditLogger('Modify Driver Profile Details', 'Driver'),
  driversController.update
);

// Delete driver profile (Admin and Fleet Manager only)
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN', 'FLEET_MANAGER'),
  validate(getDriverSchema),
  auditLogger('Delete Driver Profile', 'Driver'),
  driversController.remove
);

export default router;
