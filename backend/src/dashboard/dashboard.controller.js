import * as dashboardService from './dashboard.service.js';
import { successResponse } from '../shared/responses/responses.js';

export const getKPIs = async (req, res, next) => {
  try {
    const kpis = await dashboardService.getKPIData();
    return successResponse(res, 200, 'KPI metrics retrieved successfully.', kpis);
  } catch (error) {
    return next(error);
  }
};

export const getFleetAnalytics = async (req, res, next) => {
  try {
    const fleet = await dashboardService.getFleetAnalytics();
    return successResponse(res, 200, 'Fleet analytics retrieved successfully.', fleet);
  } catch (error) {
    return next(error);
  }
};

export const getTripAnalytics = async (req, res, next) => {
  try {
    const trip = await dashboardService.getTripAnalytics();
    return successResponse(res, 200, 'Trip analytics retrieved successfully.', trip);
  } catch (error) {
    return next(error);
  }
};

export const getRevenueAnalytics = async (req, res, next) => {
  try {
    const revenue = await dashboardService.getRevenueAnalytics();
    return successResponse(res, 200, 'Revenue analytics retrieved successfully.', revenue);
  } catch (error) {
    return next(error);
  }
};

export const getFuelAnalytics = async (req, res, next) => {
  try {
    const fuel = await dashboardService.getFuelAnalytics();
    return successResponse(res, 200, 'Fuel analytics retrieved successfully.', fuel);
  } catch (error) {
    return next(error);
  }
};

export const getMaintenanceAnalytics = async (req, res, next) => {
  try {
    const maintenance = await dashboardService.getMaintenanceAnalytics();
    return successResponse(res, 200, 'Maintenance analytics retrieved successfully.', maintenance);
  } catch (error) {
    return next(error);
  }
};

export const getExpenseBreakdown = async (req, res, next) => {
  try {
    const expense = await dashboardService.getExpenseBreakdown();
    return successResponse(res, 200, 'Expense breakdown retrieved successfully.', expense);
  } catch (error) {
    return next(error);
  }
};

export const getRecentActivity = async (req, res, next) => {
  try {
    const recentActivity = await dashboardService.getRecentActivity();
    return successResponse(res, 200, 'Recent activity retrieved successfully.', recentActivity);
  } catch (error) {
    return next(error);
  }
};

export const getAlerts = async (req, res, next) => {
  try {
    const alerts = await dashboardService.getAlerts();
    return successResponse(res, 200, 'Operational alerts retrieved successfully.', alerts);
  } catch (error) {
    return next(error);
  }
};

export const search = async (req, res, next) => {
  try {
    const query = String(req.query.q || '').trim();
    const result = await dashboardService.searchDashboardEntities(query);
    return successResponse(res, 200, 'Search results retrieved successfully.', result);
  } catch (error) {
    return next(error);
  }
};

export const getDashboard = async (req, res, next) => {
  try {
    const overview = await dashboardService.getDashboardOverview();
    return successResponse(res, 200, 'Dashboard overview retrieved successfully.', overview);
  } catch (error) {
    return next(error);
  }
};

// Backward compatibility endpoint.
export const getCharts = async (req, res, next) => {
  try {
    const charts = await dashboardService.getChartData();
    return successResponse(res, 200, 'Chart aggregates retrieved successfully.', charts);
  } catch (error) {
    return next(error);
  }
};
