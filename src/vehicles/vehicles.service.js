import { prisma } from '../config/db.js';
import { ApiError } from '../shared/errors/apiError.js';

/**
 * Creates a new vehicle after validating uniqueness of registration number
 */
export const createVehicle = async (vehicleData) => {
  const registrationNumber = vehicleData.registrationNumber.toUpperCase();

  // Validate unique registration number
  const existingVehicle = await prisma.vehicle.findUnique({
    where: { registrationNumber }
  });

  if (existingVehicle) {
    throw ApiError.badRequest(`Vehicle with registration number "${registrationNumber}" already exists.`);
  }

  return await prisma.vehicle.create({
    data: {
      ...vehicleData,
      registrationNumber
    }
  });
};

/**
 * Updates a vehicle and ensures registration uniqueness
 */
export const updateVehicle = async (id, updateData) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id }
  });

  if (!vehicle) {
    throw ApiError.notFound('Vehicle not found.');
  }

  const updatedPayload = { ...updateData };

  if (updateData.registrationNumber) {
    const registrationNumber = updateData.registrationNumber.toUpperCase();
    
    // Check if registration number matches another existing vehicle
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { registrationNumber }
    });

    if (existingVehicle && existingVehicle.id !== id) {
      throw ApiError.badRequest(`Vehicle with registration number "${registrationNumber}" is already assigned to another asset.`);
    }

    updatedPayload.registrationNumber = registrationNumber;
  }

  return await prisma.vehicle.update({
    where: { id },
    data: updatedPayload
  });
};

/**
 * Fetches a single vehicle by UUID
 */
export const getVehicleById = async (id) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id }
  });

  if (!vehicle) {
    throw ApiError.notFound('Vehicle not found.');
  }

  return vehicle;
};

/**
 * Lists vehicles using pagination, query filters, and keyword search
 */
export const listVehicles = async ({ search, status, page, limit }) => {
  const whereClause = {};

  if (status) {
    whereClause.status = status;
  }

  if (search) {
    whereClause.registrationNumber = {
      contains: search.toUpperCase()
    };
  }

  const skip = (page - 1) * limit;

  const [vehicles, total] = await Promise.all([
    prisma.vehicle.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.vehicle.count({ where: whereClause })
  ]);

  return {
    vehicles,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Performs soft-delete / retirement of a vehicle asset
 */
export const retireVehicle = async (id) => {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id }
  });

  if (!vehicle) {
    throw ApiError.notFound('Vehicle not found.');
  }

  if (vehicle.status === 'RETIRED') {
    throw ApiError.badRequest('Vehicle is already retired.');
  }

  return await prisma.vehicle.update({
    where: { id },
    data: { status: 'RETIRED' }
  });
};
