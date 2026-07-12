import { Router } from 'express';
import * as tripsController from './trips.controller.js';
import { 
  createTripSchema, 
  dispatchTripSchema, 
  completeTripSchema, 
  cancelTripSchema, 
  getTripSchema, 
  listTripsSchema 
} from './trips.validation.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { auditLogger } from '../middleware/audit.middleware.js';

const router = Router();

// Retrieve all trips (All authenticated users)
router.get(
  '/',
  authenticate,
  validate(listTripsSchema),
  tripsController.list
);

// Retrieve details for a single trip (All authenticated users)
router.get(
  '/:id',
  authenticate,
  validate(getTripSchema),
  tripsController.getOne
);

// Create a new Trip (Admin, Fleet Manager, and Dispatcher)
router.post(
  '/',
  authenticate,
  authorize('ADMIN', 'FLEET_MANAGER', 'DISPATCHER'),
  validate(createTripSchema),
  auditLogger('Create Trip Draft', 'Trip'),
  tripsController.create
);

// Dispatch a DRAFT trip (Admin, Fleet Manager, and Dispatcher)
router.post(
  '/:id/dispatch',
  authenticate,
  authorize('ADMIN', 'FLEET_MANAGER', 'DISPATCHER'),
  validate(dispatchTripSchema),
  auditLogger('Dispatch Trip', 'Trip'),
  tripsController.dispatch
);

// Complete an active trip (Admin, Fleet Manager, and Dispatcher)
router.post(
  '/:id/complete',
  authenticate,
  authorize('ADMIN', 'FLEET_MANAGER', 'DISPATCHER'),
  validate(completeTripSchema),
  auditLogger('Complete Trip Operations', 'Trip'),
  tripsController.complete
);

// Cancel a DRAFT or active trip (Admin, Fleet Manager, and Dispatcher)
router.post(
  '/:id/cancel',
  authenticate,
  authorize('ADMIN', 'FLEET_MANAGER', 'DISPATCHER'),
  validate(cancelTripSchema),
  auditLogger('Cancel Trip Operations', 'Trip'),
  tripsController.cancel
);

export default router;
