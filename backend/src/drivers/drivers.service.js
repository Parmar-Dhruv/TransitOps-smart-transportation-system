import { prisma } from '../config/db.js';
import { ApiError } from '../shared/errors/apiError.js';

/**
 * Creates a driver profile checking email/license uniqueness and ensuring license is not expired
 */
export const createDriver = async (driverData) => {
  const email = driverData.email.toLowerCase();
  const licenseNumber = driverData.licenseNumber.trim().toUpperCase();

  // Unique email check
  const existingEmail = await prisma.driver.findUnique({
    where: { email }
  });
  if (existingEmail) {
    throw ApiError.badRequest(`Driver with email "${email}" already registered.`);
  }

  // Unique license check
  const existingLicense = await prisma.driver.findUnique({
    where: { licenseNumber }
  });
  if (existingLicense) {
    throw ApiError.badRequest(`Driver with license number "${licenseNumber}" already registered.`);
  }

  // Expiry check
  const expiryDate = new Date(driverData.licenseExpiry);
  if (expiryDate <= new Date()) {
    throw ApiError.badRequest('Cannot register driver. The provided driver license has expired.');
  }

  return await prisma.driver.create({
    data: {
      ...driverData,
      email,
      licenseNumber,
      licenseExpiry: expiryDate
    }
  });
};

/**
 * Updates a driver profile enforcing status restrictions on expired licenses
 */
export const updateDriver = async (id, updateData) => {
  const driver = await prisma.driver.findUnique({
    where: { id }
  });

  if (!driver) {
    throw ApiError.notFound('Driver not found.');
  }

  const updatedPayload = { ...updateData };

  if (updateData.email) {
    const email = updateData.email.toLowerCase();
    const existing = await prisma.driver.findUnique({
      where: { email }
    });
    if (existing && existing.id !== id) {
      throw ApiError.badRequest(`Driver with email "${email}" is already registered.`);
    }
    updatedPayload.email = email;
  }

  if (updateData.licenseNumber) {
    const licenseNumber = updateData.licenseNumber.trim().toUpperCase();
    const existing = await prisma.driver.findUnique({
      where: { licenseNumber }
    });
    if (existing && existing.id !== id) {
      throw ApiError.badRequest(`Driver with license number "${licenseNumber}" is already registered.`);
    }
    updatedPayload.licenseNumber = licenseNumber;
  }

  if (updateData.licenseExpiry) {
    const expiryDate = new Date(updateData.licenseExpiry);
    const targetStatus = updateData.status || driver.status;
    if (expiryDate <= new Date() && (targetStatus === 'AVAILABLE' || targetStatus === 'ON_TRIP')) {
      throw ApiError.badRequest('Cannot set license expiry to a past date while the driver is active.');
    }
    updatedPayload.licenseExpiry = expiryDate;
  }

  if (updateData.status) {
    const expiryDate = updateData.licenseExpiry ? new Date(updateData.licenseExpiry) : driver.licenseExpiry;
    if (updateData.status === 'AVAILABLE' && expiryDate <= new Date()) {
      throw ApiError.badRequest('Cannot set driver status to AVAILABLE because their license is expired.');
    }
  }

  return await prisma.driver.update({
    where: { id },
    data: updatedPayload
  });
};

/**
 * Retrieves a single driver profile details
 */
export const getDriverById = async (id) => {
  const driver = await prisma.driver.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      }
    }
  });

  if (!driver) {
    throw ApiError.notFound('Driver profile not found.');
  }

  return driver;
};

/**
 * Lists drivers matching search criteria with pagination
 */
export const listDrivers = async ({ search, status, page, limit }) => {
  const whereClause = {};

  if (status) {
    whereClause.status = status;
  }

  if (search) {
    whereClause.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { licenseNumber: { contains: search.toUpperCase() } }
    ];
  }

  const skip = (page - 1) * limit;

  const [drivers, total] = await Promise.all([
    prisma.driver.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    }),
    prisma.driver.count({ where: whereClause })
  ]);

  return {
    drivers,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

/**
 * Standard delete operation (safely blocked if historical trip logs reference the driver)
 */
export const deleteDriver = async (id) => {
  const driver = await prisma.driver.findUnique({
    where: { id }
  });

  if (!driver) {
    throw ApiError.notFound('Driver profile not found.');
  }

  // Prevent breaking references in Trip tables
  const tripsCount = await prisma.trip.count({
    where: { driverId: id }
  });

  if (tripsCount > 0) {
    throw ApiError.badRequest('Cannot delete driver because they have active/historical trips assigned. Set status to SUSPENDED or OFF_DUTY instead.');
  }

  return await prisma.driver.delete({
    where: { id }
  });
};
