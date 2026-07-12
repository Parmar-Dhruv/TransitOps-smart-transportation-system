import * as reportsService from './reports.service.js';
import { exportToCSV } from './reports.export.js';
import { successResponse } from '../shared/responses/responses.js';

/**
 * Returns JSON report details for vehicles
 */
export const getVehiclesReport = async (req, res, next) => {
  try {
    const data = await reportsService.getVehiclesReport();
    return successResponse(res, 200, 'Vehicles operational report retrieved successfully.', data);
  } catch (error) {
    return next(error);
  }
};

/**
 * Returns JSON report details for drivers
 */
export const getDriversReport = async (req, res, next) => {
  try {
    const data = await reportsService.getDriversReport();
    return successResponse(res, 200, 'Drivers performance report retrieved successfully.', data);
  } catch (error) {
    return next(error);
  }
};

/**
 * Returns JSON report details for trips
 */
export const getTripsReport = async (req, res, next) => {
  try {
    const data = await reportsService.getTripsReport();
    return successResponse(res, 200, 'Trips operations report retrieved successfully.', data);
  } catch (error) {
    return next(error);
  }
};

/**
 * Returns JSON report summary for entire fleet utilization and costs
 */
export const getFleetReport = async (req, res, next) => {
  try {
    const data = await reportsService.getFleetReport();
    return successResponse(res, 200, 'Fleet utilization report retrieved successfully.', data);
  } catch (error) {
    return next(error);
  }
};

/**
 * Exports vehicles data into standard CSV file download
 */
export const exportVehiclesCSV = async (req, res, next) => {
  try {
    const data = await reportsService.getVehiclesReport();
    const fields = [
      'registrationNumber', 'make', 'model', 'capacity', 'odometer', 'status', 
      'totalTrips', 'totalFuelCost', 'totalMaintenanceCost', 'totalExpenses', 
      'totalOperationalCost', 'totalRevenue', 'netProfit', 'roi'
    ];
    return exportToCSV(res, 'vehicles_report.csv', data, fields);
  } catch (error) {
    return next(error);
  }
};

/**
 * Exports drivers data into standard CSV file download
 */
export const exportDriversCSV = async (req, res, next) => {
  try {
    const data = await reportsService.getDriversReport();
    const fields = [
      'name', 'email', 'licenseNumber', 'licenseExpiry', 'safetyScore', 'status', 
      'totalTrips', 'totalFuelCost', 'totalExpenses', 'totalRevenue', 'netProfit'
    ];
    return exportToCSV(res, 'drivers_report.csv', data, fields);
  } catch (error) {
    return next(error);
  }
};

/**
 * Exports trips data into standard CSV file download
 */
export const exportTripsCSV = async (req, res, next) => {
  try {
    const data = await reportsService.getTripsReport();
    const fields = [
      'tripNumber', 'status', 'vehicleRegistration', 'driverName', 'cargoWeight', 
      'distance', 'startTime', 'endTime', 'fuelUsed', 'revenue', 'operationalCost', 
      'netProfit', 'roi'
    ];
    return exportToCSV(res, 'trips_report.csv', data, fields);
  } catch (error) {
    return next(error);
  }
};
