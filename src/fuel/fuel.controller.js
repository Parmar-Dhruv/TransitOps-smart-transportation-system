import * as fuelService from './fuel.service.js';
import { successResponse } from '../shared/responses/responses.js';

/**
 * Records a new fuel refill log
 */
export const create = async (req, res, next) => {
  try {
    const data = await fuelService.createFuelLog(req.body);
    return successResponse(res, 201, 'Fuel purchase log recorded successfully.', data);
  } catch (error) {
    return next(error);
  }
};

/**
 * Lists all fuel purchase records with filters
 */
export const list = async (req, res, next) => {
  try {
    const { vehicleId, driverId, page, limit } = req.query;
    const data = await fuelService.listFuelLogs({ vehicleId, driverId, page, limit });
    return successResponse(res, 200, 'Fuel log records list retrieved successfully.', data);
  } catch (error) {
    return next(error);
  }
};

/**
 * Fetches details for a single refuel log
 */
export const getOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await fuelService.getFuelLogById(id);
    return successResponse(res, 200, 'Fuel log details retrieved successfully.', data);
  } catch (error) {
    return next(error);
  }
};

/**
 * Updates details of a refuel log
 */
export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await fuelService.updateFuelLog(id, req.body);
    return successResponse(res, 200, 'Fuel log details updated successfully.', data);
  } catch (error) {
    return next(error);
  }
};

/**
 * Deletes a refuel log
 */
export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await fuelService.deleteFuelLog(id);
    return successResponse(res, 200, 'Fuel log record deleted successfully.', data);
  } catch (error) {
    return next(error);
  }
};
