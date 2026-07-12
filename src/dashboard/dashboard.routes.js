import { Router } from 'express';
import * as dashboardController from './dashboard.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Retrieve full dashboard data summary (All authenticated users)
router.get(
  '/',
  authenticate,
  dashboardController.getDashboard
);

// Retrieve KPI metrics only (All authenticated users)
router.get(
  '/kpis',
  authenticate,
  dashboardController.getKPIs
);

// Retrieve charts data aggregates (All authenticated users)
router.get(
  '/charts',
  authenticate,
  dashboardController.getCharts
);

export default router;
