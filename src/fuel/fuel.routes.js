import { Router } from 'express';
import * as fuelController from './fuel.controller.js';
import { 
  createFuelSchema, 
  updateFuelSchema, 
  getFuelSchema, 
  listFuelSchema 
} from './fuel.validation.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { auditLogger } from '../middleware/audit.middleware.js';

const router = Router();

// Allowed roles list
const ALLOWED_ROLES = ['ADMIN', 'FLEET_MANAGER', 'DISPATCHER', 'FINANCIAL_ANALYST'];

// Retrieve all fuel refill logs
router.get(
  '/',
  authenticate,
  authorize(...ALLOWED_ROLES),
  validate(listFuelSchema),
  fuelController.list
);

// Retrieve details for a single refuel log
router.get(
  '/:id',
  authenticate,
  authorize(...ALLOWED_ROLES),
  validate(getFuelSchema),
  fuelController.getOne
);

// Register a new fuel purchase log
router.post(
  '/',
  authenticate,
  authorize(...ALLOWED_ROLES),
  validate(createFuelSchema),
  auditLogger('Log Fuel Purchase', 'FuelLog'),
  fuelController.create
);

// Update details of a fuel purchase log
router.patch(
  '/:id',
  authenticate,
  authorize(...ALLOWED_ROLES),
  validate(updateFuelSchema),
  auditLogger('Modify Fuel Purchase Details', 'FuelLog'),
  fuelController.update
);

// Delete a fuel purchase log record
router.delete(
  '/:id',
  authenticate,
  authorize(...ALLOWED_ROLES),
  validate(getFuelSchema),
  auditLogger('Delete Fuel Purchase Log', 'FuelLog'),
  fuelController.remove
);

export default router;
