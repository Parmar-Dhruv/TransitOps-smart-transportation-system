import * as expensesService from './expenses.service.js';
import { successResponse } from '../shared/responses/responses.js';

/**
 * Logs a new expense record in the ledger
 */
export const create = async (req, res, next) => {
  try {
    const data = await expensesService.createExpense(req.body);
    return successResponse(res, 201, 'Expense ledger entry recorded successfully.', data);
  } catch (error) {
    return next(error);
  }
};

/**
 * Lists expense records with filters and paging
 */
export const list = async (req, res, next) => {
  try {
    const { vehicleId, tripId, driverId, category, page, limit } = req.query;
    const data = await expensesService.listExpenses({ vehicleId, tripId, driverId, category, page, limit });
    return successResponse(res, 200, 'Expense records list retrieved successfully.', data);
  } catch (error) {
    return next(error);
  }
};

/**
 * Fetches details for a single ledger expense
 */
export const getOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await expensesService.getExpenseById(id);
    return successResponse(res, 200, 'Expense details retrieved successfully.', data);
  } catch (error) {
    return next(error);
  }
};

/**
 * Updates details of an expense record
 */
export const update = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await expensesService.updateExpense(id, req.body);
    return successResponse(res, 200, 'Expense record details updated successfully.', data);
  } catch (error) {
    return next(error);
  }
};

/**
 * Deletes an expense ledger record
 */
export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = await expensesService.deleteExpense(id);
    return successResponse(res, 200, 'Expense record deleted successfully.', data);
  } catch (error) {
    return next(error);
  }
};
