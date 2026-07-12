import * as maintenanceService from './maintenance.service.js';
import { successResponse } from '../shared/responses/responses.js';

/**
 * Schedules a new maintenance log
 */
export const create = async (req, res, next) => {
  try {
    const data = await maintenanceService.createMaintenance(req.body);
    return successResponse(res, 201, 'Maintenance scheduled successfully.', data);
  } catch (error) {
    return next(error);
  }
};

/**
 * Lists maintenance records with filters
 */
export const list = async (req, res, next) => {
  try {
    const { vehicleId, status, page, limit } = req.query;
    const data = await maintenanceService.listMaintenances({ vehicleId, status, page, limit });
    return successResponse(res, 200, 'Maintenance logs list retrieved successfully.', data);
  } catch (error) {
    return next(error);
  }
};

/**
 * Retrieves details for a single maintenance log
 */
export const getOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await maintenanceService.getMaintenanceById(id);
    return successResponse(res, 200, 'Maintenance log details retrieved successfully.', data);
  } catch (error) {
    return next(error);
  }
};

/**
 * Updates basic maintenance log properties
 */
export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await maintenanceService.updateMaintenance(id, req.body);
    return successResponse(res, 200, 'Maintenance log updated successfully.', data);
  } catch (error) {
    return next(error);
  }
};

/**
 * Transitions scheduled maintenance to IN_PROGRESS
 */
export const start = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await maintenanceService.startMaintenance(id);
    return successResponse(res, 200, 'Maintenance started successfully. Vehicle status set to IN_SHOP.', data);
  } catch (error) {
    return next(error);
  }
};

/**
 * Transitions maintenance to COMPLETED
 */
export const complete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await maintenanceService.completeMaintenance(id);
    return successResponse(res, 200, 'Maintenance completed successfully. Vehicle status restored.', data);
  } catch (error) {
    return next(error);
  }
};

/**
 * Deletes a maintenance log
 */
export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await maintenanceService.deleteMaintenance(id);
    return successResponse(res, 200, 'Maintenance log deleted successfully.', data);
  } catch (error) {
    return next(error);
  }
};
