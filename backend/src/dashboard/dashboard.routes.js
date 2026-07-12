import { Router } from 'express';
import * as dashboardController from './dashboard.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get(
  '/',
  authenticate,
  dashboardController.getDashboard
);

router.get(
  '/kpis',
  authenticate,
  dashboardController.getKPIs
);

router.get(
  '/fleet-analytics',
  authenticate,
  dashboardController.getFleetAnalytics
);

router.get(
  '/trip-analytics',
  authenticate,
  dashboardController.getTripAnalytics
);

router.get(
  '/revenue-analytics',
  authenticate,
  dashboardController.getRevenueAnalytics
);

router.get(
  '/fuel-analytics',
  authenticate,
  dashboardController.getFuelAnalytics
);

router.get(
  '/maintenance-analytics',
  authenticate,
  dashboardController.getMaintenanceAnalytics
);

router.get(
  '/expense-breakdown',
  authenticate,
  dashboardController.getExpenseBreakdown
);

router.get(
  '/recent-activity',
  authenticate,
  dashboardController.getRecentActivity
);

router.get(
  '/alerts',
  authenticate,
  dashboardController.getAlerts
);

router.get(
  '/search',
  authenticate,
  dashboardController.search
);

// Backward compatibility route for previous dashboard chart API.
router.get(
  '/charts',
  authenticate,
  dashboardController.getCharts
);

export default router;
