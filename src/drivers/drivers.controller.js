import * as driversService from './drivers.service.js';
import { successResponse } from '../shared/responses/responses.js';

/**
 * Creates a driver profile record
 */
export const create = async (req, res, next) => {
  try {
    const data = await driversService.createDriver(req.body);
    return successResponse(res, 201, 'Driver profile registered successfully.', data);
  } catch (error) {
    return next(error);
  }
};

/**
 * Updates a driver profile record
 */
export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await driversService.updateDriver(id, req.body);
    return successResponse(res, 200, 'Driver profile details updated successfully.', data);
  } catch (error) {
    return next(error);
  }
};

/**
 * Fetches a single driver profile details
 */
export const getOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await driversService.getDriverById(id);
    return successResponse(res, 200, 'Driver profile details retrieved successfully.', data);
  } catch (error) {
    return next(error);
  }
};

/**
 * Lists drivers matching query criteria with pagination
 */
export const list = async (req, res, next) => {
  try {
    const { search, status, page, limit } = req.query;
    const data = await driversService.listDrivers({ search, status, page, limit });
    return successResponse(res, 200, 'Drivers list retrieved successfully.', data);
  } catch (error) {
    return next(error);
  }
};

/**
 * Deletes a driver profile record
 */
export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await driversService.deleteDriver(id);
    return successResponse(res, 200, 'Driver profile deleted successfully.', data);
  } catch (error) {
    return next(error);
  }
};
