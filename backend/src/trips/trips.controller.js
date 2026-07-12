import * as tripsService from './trips.service.js';
import { successResponse } from '../shared/responses/responses.js';

/**
 * Creates a DRAFT trip record
 */
export const create = async (req, res, next) => {
  try {
    const data = await tripsService.createTrip(req.body, req.user.id);
    return successResponse(res, 201, 'Trip draft registered successfully.', data);
  } catch (error) {
    return next(error);
  }
};

/**
 * Dispatches a DRAFT trip
 */
export const dispatch = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await tripsService.dispatchTrip(id);
    return successResponse(res, 200, 'Trip dispatched successfully.', data);
  } catch (error) {
    return next(error);
  }
};

/**
 * Completes a dispatched trip
 */
export const complete = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await tripsService.completeTrip(id, req.body);
    return successResponse(res, 200, 'Trip marked as completed successfully.', data);
  } catch (error) {
    return next(error);
  }
};

/**
 * Cancels a trip
 */
export const cancel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cancelReason } = req.body;
    const data = await tripsService.cancelTrip(id, cancelReason);
    return successResponse(res, 200, 'Trip cancelled successfully.', data);
  } catch (error) {
    return next(error);
  }
};

/**
 * Retrieves details for a single trip
 */
export const getOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await tripsService.getTripById(id);
    return successResponse(res, 200, 'Trip details retrieved successfully.', data);
  } catch (error) {
    return next(error);
  }
};

/**
 * Lists trips with paging and filters
 */
export const list = async (req, res, next) => {
  try {
    const { status, vehicleId, driverId, page, limit } = req.query;
    const data = await tripsService.listTrips({ status, vehicleId, driverId, page, limit });
    return successResponse(res, 200, 'Trips list retrieved successfully.', data);
  } catch (error) {
    return next(error);
  }
};
