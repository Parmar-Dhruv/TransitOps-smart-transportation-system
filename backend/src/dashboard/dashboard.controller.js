import * as dashboardService from './dashboard.service.js';
import { successResponse } from '../shared/responses/responses.js';

/**
 * Returns aggregated fleet operational KPIs
 */
export const getKPIs = async (req, res, next) => {
  try {
    const kpis = await dashboardService.getKPIs();
    return successResponse(res, 200, 'KPI metrics retrieved successfully.', kpis);
  } catch (error) {
    return next(error);
  }
};

/**
 * Returns cost aggregations grouped by month and vehicle status distributions
 */
export const getCharts = async (req, res, next) => {
  try {
    const charts = await dashboardService.getChartData();
    return successResponse(res, 200, 'Chart aggregates retrieved successfully.', charts);
  } catch (error) {
    return next(error);
  }
};

/**
 * Returns a combined view of KPIs and chart statistics
 */
export const getDashboard = async (req, res, next) => {
  try {
    const kpis = await dashboardService.getKPIs();
    const charts = await dashboardService.getChartData();
    return successResponse(res, 200, 'Dashboard overview retrieved successfully.', {
      kpis,
      charts
    });
  } catch (error) {
    return next(error);
  }
};
