import { prisma } from '../config/db.js';
import { ApiError } from '../shared/errors/apiError.js';

/**
 * Logs a new fuel refill event
 */
export const createFuelLog = async (fuelData) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: fuelData.vehicleId }
  });

  if (!vehicle) {
    throw ApiError.notFound('Vehicle asset not found.');
  }

  const driver = await prisma.driver.findUnique({
    where: { id: fuelData.driverId }
  });

  if (!driver) {
    throw ApiError.notFound('Driver profile not found.');
  }

  // Business Rule: Odometer must be greater than or equal to current odometer reading
  if (fuelData.odometer < vehicle.odometer) {
    throw ApiError.badRequest(`Invalid odometer reading (${fuelData.odometer}). Cannot be less than the vehicle's current odometer (${vehicle.odometer}).`);
  }

  // Automatic Calculation: totalCost = liters * costPerLiter
  const totalCost = fuelData.liters * fuelData.costPerLiter;

  const logPayload = {
    ...fuelData,
    totalCost,
    refuelDate: new Date(fuelData.refuelDate)
  };

  // Run database changes in transaction to capture fuel entry and update odometer
  return await prisma.$transaction(async (tx) => {
    const fuelLog = await tx.fuelLog.create({
      data: logPayload,
      include: { vehicle: true, driver: true }
    });

    await tx.vehicle.update({
      where: { id: vehicle.id },
      data: { odometer: fuelData.odometer }
    });

    return fuelLog;
  });
};

/**
 * Updates properties of a fuel log record
 */
export const updateFuelLog = async (id, updateData) => {
  const log = await prisma.fuelLog.findUnique({
    where: { id },
    include: { vehicle: true }
  });

  if (!log) {
    throw ApiError.notFound('Fuel log record not found.');
  }

  const updatedPayload = { ...updateData };

  if (updateData.refuelDate) {
    updatedPayload.refuelDate = new Date(updateData.refuelDate);
  }

  // Recalculate cost if liters or costPerLiter changes
  const liters = updateData.liters !== undefined ? updateData.liters : log.liters;
  const costPerLiter = updateData.costPerLiter !== undefined ? updateData.costPerLiter : log.costPerLiter;
  updatedPayload.totalCost = liters * costPerLiter;

  // Validate odometer if updated
  if (updateData.odometer !== undefined) {
    // Look up previous odometer before this log if possible, or verify against vehicle odometer
    if (updateData.odometer < log.vehicle.odometer && updateData.odometer !== log.odometer) {
      throw ApiError.badRequest(`Invalid odometer reading. Cannot set it back below vehicle odometer.`);
    }
  }

  return await prisma.$transaction(async (tx) => {
    const fuelLog = await tx.fuelLog.update({
      where: { id },
      data: updatedPayload,
      include: { vehicle: true, driver: true }
    });

    // If odometer updated, reflect on vehicle if it is the highest reading
    if (updateData.odometer !== undefined && updateData.odometer > log.vehicle.odometer) {
      await tx.vehicle.update({
        where: { id: log.vehicleId },
        data: { odometer: updateData.odometer }
      });
    }

    return fuelLog;
  });
};

/**
 * Retrieves a single fuel log details
 */
export const getFuelLogById = async (id) => {
  const log = await prisma.fuelLog.findUnique({
    where: { id },
    include: { vehicle: true, driver: true }
  });

  if (!log) {
    throw ApiError.notFound('Fuel log record not found.');
  }

  return log;
};

/**
 * Lists fuel log records with filters
 */
export const listFuelLogs = async ({ vehicleId, driverId, page, limit }) => {
  const whereClause = {};

  if (vehicleId) {
    whereClause.vehicleId = vehicleId;
  }
  if (driverId) {
    whereClause.driverId = driverId;
  }

  const skip = (page - 1) * limit;

  const [fuelLogs, total] = await Promise.all([
    prisma.fuelLog.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { vehicle: true, driver: true }
    }),
    prisma.fuelLog.count({ where: whereClause })
  ]);

  return {
    fuelLogs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Deletes a fuel log record
 */
export const deleteFuelLog = async (id) => {
  const log = await prisma.fuelLog.findUnique({
    where: { id }
  });

  if (!log) {
    throw ApiError.notFound('Fuel log record not found.');
  }

  return await prisma.fuelLog.delete({
    where: { id }
  });
};
