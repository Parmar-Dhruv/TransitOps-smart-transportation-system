import { Router } from 'express';
import * as vehiclesController from './vehicles.controller.js';
import { 
  createVehicleSchema, 
  updateVehicleSchema, 
  getVehicleSchema, 
  listVehiclesSchema 
} from './vehicles.validation.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { auditLogger } from '../middleware/audit.middleware.js';

const router = Router();

// Retrieve all vehicles with filter/pagination (All auth users)
router.get(
  '/',
  authenticate,
  validate(listVehiclesSchema),
  vehiclesController.list
);

// Retrieve single vehicle detail (All auth users)
router.get(
  '/:id',
  authenticate,
  validate(getVehicleSchema),
  vehiclesController.getOne
);

// Register a new vehicle (Admin and Fleet Manager only)
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'FLEET_MANAGER'),
  validate(createVehicleSchema),
  auditLogger('Register Vehicle Asset', 'Vehicle'),
  vehiclesController.create
);

// Update details of a vehicle (Admin and Fleet Manager only)
router.put(
  '/:id',
  authenticate,
  authorize('ADMIN', 'FLEET_MANAGER'),
  validate(updateVehicleSchema),
  auditLogger('Modify Vehicle Asset Details', 'Vehicle'),
  vehiclesController.update
);

// Retire / soft delete a vehicle (Admin and Fleet Manager only)
router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN', 'FLEET_MANAGER'),
  validate(getVehicleSchema),
  auditLogger('Retire Vehicle Asset', 'Vehicle'),
  vehiclesController.remove
);

export default router;
