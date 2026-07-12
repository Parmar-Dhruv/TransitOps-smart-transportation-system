import { prisma } from '../config/db.js';
import { ApiError } from '../shared/errors/apiError.js';

/**
 * Schedules a new maintenance log for a vehicle
 */
export const createMaintenance = async (maintenanceData) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: maintenanceData.vehicleId }
  });

  if (!vehicle) {
    throw ApiError.notFound('Vehicle not found.');
  }

  // Business Rule: Vehicle cannot enter maintenance if it is currently ON_TRIP
  if (vehicle.status === 'ON_TRIP') {
    throw ApiError.badRequest('Cannot schedule maintenance. Vehicle is currently active on a trip.');
  }

  // Enforce duplicate check if creating with immediate status IN_PROGRESS
  if (maintenanceData.status === 'IN_PROGRESS') {
    const activeMaintenance = await prisma.maintenanceLog.findFirst({
      where: {
        vehicleId: vehicle.id,
        status: 'IN_PROGRESS'
      }
    });
    if (activeMaintenance) {
      throw ApiError.badRequest('Vehicle already has an active, in-progress maintenance record.');
    }
  }

  const logData = {
    ...maintenanceData,
    startDate: new Date(maintenanceData.startDate),
    endDate: maintenanceData.endDate ? new Date(maintenanceData.endDate) : null
  };

  // If status is IN_PROGRESS, lock vehicle inside a transaction
  if (logData.status === 'IN_PROGRESS') {
    return await prisma.$transaction(async (tx) => {
      const log = await tx.maintenanceLog.create({ data: logData });
      await tx.vehicle.update({
        where: { id: vehicle.id },
        data: { status: 'IN_SHOP' }
      });
      return log;
    });
  }

  return await prisma.maintenanceLog.create({ data: logData });
};

/**
 * Transitions a SCHEDULED maintenance to IN_PROGRESS. Sets vehicle status to IN_SHOP.
 */
export const startMaintenance = async (id) => {
  const log = await prisma.maintenanceLog.findUnique({
    where: { id },
    include: { vehicle: true }
  });

  if (!log) {
    throw ApiError.notFound('Maintenance log not found.');
  }

  if (log.status !== 'SCHEDULED') {
    throw ApiError.badRequest(`Cannot start maintenance. Log is in "${log.status}" state, expected "SCHEDULED".`);
  }

  const { vehicle } = log;

  // Business Rule: Cannot start if vehicle is currently ON_TRIP
  if (vehicle.status === 'ON_TRIP') {
    throw ApiError.badRequest('Cannot start maintenance. Vehicle is currently on active duty (ON_TRIP).');
  }

  // Business Rule: Prevent multiple ACTIVE maintenance records for one vehicle
  const activeMaintenance = await prisma.maintenanceLog.findFirst({
    where: {
      vehicleId: vehicle.id,
      status: 'IN_PROGRESS'
    }
  });

  if (activeMaintenance) {
    throw ApiError.badRequest('This vehicle is already in active maintenance (IN_PROGRESS).');
  }

  return await prisma.$transaction(async (tx) => {
    const updatedLog = await tx.maintenanceLog.update({
      where: { id },
      data: { status: 'IN_PROGRESS' }
    });

    await tx.vehicle.update({
      where: { id: vehicle.id },
      data: { status: 'IN_SHOP' }
    });

    return updatedLog;
  });
};

/**
 * Transitions maintenance log to COMPLETED. Restores vehicle status to AVAILABLE unless RETIRED.
 */
export const completeMaintenance = async (id) => {
  const log = await prisma.maintenanceLog.findUnique({
    where: { id },
    include: { vehicle: true }
  });

  if (!log) {
    throw ApiError.notFound('Maintenance log not found.');
  }

  if (log.status === 'COMPLETED') {
    throw ApiError.badRequest('Maintenance log is already marked as completed.');
  }

  const { vehicle } = log;

  return await prisma.$transaction(async (tx) => {
    const updatedLog = await tx.maintenanceLog.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        endDate: new Date()
      }
    });

    // Business Rule: Restores status to AVAILABLE unless it is retired
    if (vehicle.status !== 'RETIRED') {
      await tx.vehicle.update({
        where: { id: vehicle.id },
        data: { status: 'AVAILABLE' }
      });
    }

    return updatedLog;
  });
};

/**
 * Updates description, cost, etc of a maintenance log
 */
export const updateMaintenance = async (id, updateData) => {
  const log = await prisma.maintenanceLog.findUnique({
    where: { id }
  });

  if (!log) {
    throw ApiError.notFound('Maintenance log not found.');
  }

  const dataToUpdate = { ...updateData };

  if (updateData.startDate) {
    dataToUpdate.startDate = new Date(updateData.startDate);
  }
  if (updateData.endDate) {
    dataToUpdate.endDate = new Date(updateData.endDate);
  }

  return await prisma.maintenanceLog.update({
    where: { id },
    data: dataToUpdate
  });
};

/**
 * Fetches a single maintenance log
 */
export const getMaintenanceById = async (id) => {
  const log = await prisma.maintenanceLog.findUnique({
    where: { id },
    include: { vehicle: true }
  });

  if (!log) {
    throw ApiError.notFound('Maintenance log not found.');
  }

  return log;
};

/**
 * Lists maintenance logs with filters
 */
export const listMaintenances = async ({ vehicleId, status, page, limit }) => {
  const whereClause = {};

  if (vehicleId) {
    whereClause.vehicleId = vehicleId;
  }
  if (status) {
    whereClause.status = status;
  }

  const skip = (page - 1) * limit;

  const [maintenances, total] = await Promise.all([
    prisma.maintenanceLog.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { vehicle: true }
    }),
    prisma.maintenanceLog.count({ where: whereClause })
  ]);

  return {
    maintenances,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Deletes a maintenance log
 */
export const deleteMaintenance = async (id) => {
  const log = await prisma.maintenanceLog.findUnique({
    where: { id }
  });

  if (!log) {
    throw ApiError.notFound('Maintenance log not found.');
  }

  return await prisma.maintenanceLog.delete({
    where: { id }
  });
};
