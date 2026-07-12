import { Router } from 'express';
import * as reportsController from './reports.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';

const router = Router();

// Allowed roles for generating reports
const ALLOWED_ROLES = ['ADMIN', 'FLEET_MANAGER', 'FINANCIAL_ANALYST'];

// JSON report queries
router.get(
  '/vehicles',
  authenticate,
  authorize(...ALLOWED_ROLES),
  reportsController.getVehiclesReport
);

router.get(
  '/drivers',
  authenticate,
  authorize(...ALLOWED_ROLES),
  reportsController.getDriversReport
);

router.get(
  '/trips',
  authenticate,
  authorize(...ALLOWED_ROLES),
  reportsController.getTripsReport
);

router.get(
  '/fleet',
  authenticate,
  authorize(...ALLOWED_ROLES),
  reportsController.getFleetReport
);

// CSV downloads
router.get(
  '/export/vehicles',
  authenticate,
  authorize(...ALLOWED_ROLES),
  reportsController.exportVehiclesCSV
);

router.get(
  '/export/drivers',
  authenticate,
  authorize(...ALLOWED_ROLES),
  reportsController.exportDriversCSV
);

router.get(
  '/export/trips',
  authenticate,
  authorize(...ALLOWED_ROLES),
  reportsController.exportTripsCSV
);

export default router;
