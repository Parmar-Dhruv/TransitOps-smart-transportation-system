import * as vehiclesService from './vehicles.service.js';
import { successResponse } from '../shared/responses/responses.js';

/**
 * Creates a vehicle record
 */
export const create = async (req, res, next) => {
  try {
    const data = await vehiclesService.createVehicle(req.body);
    return successResponse(res, 201, 'Vehicle asset registered successfully.', data);
  } catch (error) {
    return next(error);
  }
};

/**
 * Updates a vehicle record
 */
export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await vehiclesService.updateVehicle(id, req.body);
    return successResponse(res, 200, 'Vehicle asset details updated successfully.', data);
  } catch (error) {
    return next(error);
  }
};

/**
 * Fetches a single vehicle record by ID
 */
export const getOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await vehiclesService.getVehicleById(id);
    return successResponse(res, 200, 'Vehicle asset details retrieved successfully.', data);
  } catch (error) {
    return next(error);
  }
};

/**
 * Lists vehicles matching search query and status filters
 */
export const list = async (req, res, next) => {
  try {
    const { search, status, page, limit } = req.query;
    const data = await vehiclesService.listVehicles({ search, status, page, limit });
    return successResponse(res, 200, 'Vehicle assets list retrieved successfully.', data);
  } catch (error) {
    return next(error);
  }
};

/**
 * Retires (soft-deletes) a vehicle asset record
 */
export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await vehiclesService.retireVehicle(id);
    return successResponse(res, 200, 'Vehicle retired/soft-deleted successfully.', data);
  } catch (error) {
    return next(error);
  }
};
