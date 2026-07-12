import { prisma } from '../config/db.js';
import { ApiError } from '../shared/errors/apiError.js';

/**
 * Creates a financial ledger expense record
 */
export const createExpense = async (expenseData) => {
  const { vehicleId, tripId, driverId, amount, category, date } = expenseData;

  // Business Rule: Must belong to at least one entity (Vehicle OR Trip OR Driver)
  if (!vehicleId && !tripId && !driverId) {
    throw ApiError.badRequest('An expense must be associated with at least one entity: a Vehicle, a Trip, or a Driver.');
  }

  // Validate referenced assets exist
  if (vehicleId) {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) throw ApiError.notFound('Referenced vehicle not found.');
  }
  if (tripId) {
    const trip = await prisma.trip.findUnique({ where: { id: tripId } });
    if (!trip) throw ApiError.notFound('Referenced trip not found.');
  }
  if (driverId) {
    const driver = await prisma.driver.findUnique({ where: { id: driverId } });
    if (!driver) throw ApiError.notFound('Referenced driver not found.');
  }

  const parsedDate = new Date(date);

  // Business Rule: Prevent duplicate maintenance expenses on the same vehicle for the same cost and calendar day
  if (category === 'MAINTENANCE' && vehicleId) {
    const startOfDay = new Date(parsedDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(parsedDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const duplicate = await prisma.expense.findFirst({
      where: {
        vehicleId,
        category: 'MAINTENANCE',
        amount,
        date: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });

    if (duplicate) {
      throw ApiError.badRequest('Duplicate warning: A maintenance expense with the same vehicle, cost, and date has already been logged.');
    }
  }

  return await prisma.expense.create({
    data: {
      ...expenseData,
      date: parsedDate
    }
  });
};

/**
 * Updates basic details of an expense record
 */
export const updateExpense = async (id, updateData) => {
  const expense = await prisma.expense.findUnique({
    where: { id }
  });

  if (!expense) {
    throw ApiError.notFound('Expense record not found.');
  }

  const updatedPayload = { ...updateData };

  if (updateData.date) {
    updatedPayload.date = new Date(updateData.date);
  }

  return await prisma.expense.update({
    where: { id },
    data: updatedPayload
  });
};

/**
 * Retrieves a single expense details
 */
export const getExpenseById = async (id) => {
  const expense = await prisma.expense.findUnique({
    where: { id },
    include: { vehicle: true, trip: true, driver: true }
  });

  if (!expense) {
    throw ApiError.notFound('Expense record not found.');
  }

  return expense;
};

/**
 * Lists expenses with filtering and page limit options
 */
export const listExpenses = async ({ vehicleId, tripId, driverId, category, page, limit }) => {
  const whereClause = {};

  if (vehicleId) {
    whereClause.vehicleId = vehicleId;
  }
  if (tripId) {
    whereClause.tripId = tripId;
  }
  if (driverId) {
    whereClause.driverId = driverId;
  }
  if (category) {
    whereClause.category = category;
  }

  const skip = (page - 1) * limit;

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { date: 'desc' },
      include: { vehicle: true, trip: true, driver: true }
    }),
    prisma.expense.count({ where: whereClause })
  ]);

  return {
    expenses,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Deletes an expense ledger record
 */
export const deleteExpense = async (id) => {
  const expense = await prisma.expense.findUnique({
    where: { id }
  });

  if (!expense) {
    throw ApiError.notFound('Expense record not found.');
  }

  return await prisma.expense.delete({
    where: { id }
  });
};
