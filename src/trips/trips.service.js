import { prisma } from '../config/db.js';
import { ApiError } from '../shared/errors/apiError.js';

/**
 * Creates a DRAFT trip record
 */
export const createTrip = async (tripData, dispatcherId) => {
  // Verify vehicle exists
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: tripData.vehicleId }
  });
  if (!vehicle) {
    throw ApiError.notFound('Assigned vehicle not found.');
  }

  // Verify driver exists
  const driver = await prisma.driver.findUnique({
    where: { id: tripData.driverId }
  });
  if (!driver) {
    throw ApiError.notFound('Assigned driver not found.');
  }

  // Generate unique readable trip number
  const uniqueId = Math.floor(1000 + Math.random() * 9000);
  const datePrefix = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const tripNumber = `TR-${datePrefix}-${uniqueId}`;

  return await prisma.trip.create({
    data: {
      ...tripData,
      tripNumber,
      dispatcherId,
      status: 'DRAFT'
    },
    include: {
      vehicle: true,
      driver: true,
      dispatcher: {
        select: { id: true, email: true, name: true }
      }
    }
  });
};

/**
 * Dispatches a DRAFT trip. Enforces operational validations and locks driver/vehicle inside a transaction.
 */
export const dispatchTrip = async (id) => {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: { vehicle: true, driver: true }
  });

  if (!trip) {
    throw ApiError.notFound('Trip not found.');
  }

  // Validation: Trip state must be DRAFT
  if (trip.status !== 'DRAFT') {
    throw ApiError.badRequest(`Cannot dispatch trip. Current status is "${trip.status}", expected "DRAFT".`);
  }

  const { vehicle, driver } = trip;

  // Validation: Vehicle availability
  if (!vehicle) {
    throw ApiError.badRequest('No vehicle is assigned to this trip.');
  }
  if (vehicle.status === 'RETIRED') {
    throw ApiError.badRequest('Assigned vehicle has been retired and cannot be dispatched.');
  }
  if (vehicle.status === 'IN_SHOP') {
    throw ApiError.badRequest('Assigned vehicle is currently in maintenance shop.');
  }
  if (vehicle.status === 'ON_TRIP') {
    throw ApiError.badRequest('Assigned vehicle is already on active duty (ON_TRIP).');
  }

  // Validation: Driver availability
  if (!driver) {
    throw ApiError.badRequest('No driver is assigned to this trip.');
  }
  if (driver.status === 'SUSPENDED') {
    throw ApiError.badRequest('Assigned driver is currently suspended.');
  }
  if (driver.status === 'OFF_DUTY') {
    throw ApiError.badRequest('Assigned driver is currently off duty.');
  }
  if (driver.status === 'ON_TRIP') {
    throw ApiError.badRequest('Assigned driver is already driving on active duty (ON_TRIP).');
  }

  // Validation: License check
  const now = new Date();
  if (new Date(driver.licenseExpiry) <= now) {
    throw ApiError.badRequest('Assigned driver cannot drive because their operator license has expired.');
  }

  // Validation: Payload capacity constraint
  if (trip.cargoWeight > vehicle.capacity) {
    throw ApiError.badRequest(`Cargo weight (${trip.cargoWeight} kg) exceeds vehicle payload limit (${vehicle.capacity} kg).`);
  }

  // Run updates inside a single isolated transaction
  return await prisma.$transaction(async (tx) => {
    // 1. Set trip status to DISPATCHED
    const updatedTrip = await tx.trip.update({
      where: { id },
      data: {
        status: 'DISPATCHED',
        startTime: new Date()
      }
    });

    // 2. Lock vehicle status
    await tx.vehicle.update({
      where: { id: vehicle.id },
      data: { status: 'ON_TRIP' }
    });

    // 3. Lock driver status
    await tx.driver.update({
      where: { id: driver.id },
      data: { status: 'ON_TRIP' }
    });

    return updatedTrip;
  });
};

/**
 * Completes a dispatched trip, updates odometer, and restores statuses inside a transaction
 */
export const completeTrip = async (id, { endOdometer, endTime, fuelUsed, revenue }) => {
  const trip = await prisma.trip.findUnique({
    where: { id }
  });

  if (!trip) {
    throw ApiError.notFound('Trip not found.');
  }

  if (trip.status !== 'DISPATCHED') {
    throw ApiError.badRequest(`Cannot complete trip. Current status is "${trip.status}", expected "DISPATCHED".`);
  }

  if (endOdometer < trip.startOdometer) {
    throw ApiError.badRequest(`Completion odometer (${endOdometer}) cannot be less than starting odometer (${trip.startOdometer}).`);
  }

  const completionTime = endTime ? new Date(endTime) : new Date();

  return await prisma.$transaction(async (tx) => {
    // 1. Close the trip details
    const completedTrip = await tx.trip.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        endOdometer,
        endTime: completionTime,
        fuelUsed,
        revenue
      }
    });

    // 2. Release vehicle and update its total mileage
    await tx.vehicle.update({
      where: { id: trip.vehicleId },
      data: {
        status: 'AVAILABLE',
        odometer: endOdometer
      }
    });

    // 3. Release driver to available
    await tx.driver.update({
      where: { id: trip.driverId },
      data: { status: 'AVAILABLE' }
    });

    return completedTrip;
  });
};

/**
 * Cancels a DRAFT or DISPATCHED trip and restores driver/vehicle availability inside a transaction
 */
export const cancelTrip = async (id, cancelReason) => {
  const trip = await prisma.trip.findUnique({
    where: { id }
  });

  if (!trip) {
    throw ApiError.notFound('Trip not found.');
  }

  if (trip.status === 'COMPLETED' || trip.status === 'CANCELLED') {
    throw ApiError.badRequest(`Cannot cancel trip in "${trip.status}" state.`);
  }

  const wasDispatched = trip.status === 'DISPATCHED';

  return await prisma.$transaction(async (tx) => {
    // 1. Change status to CANCELLED
    const cancelledTrip = await tx.trip.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        cancelReason
      }
    });

    // 2. If it was active, restore assets to AVAILABLE
    if (wasDispatched) {
      await tx.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: 'AVAILABLE' }
      });

      await tx.driver.update({
        where: { id: trip.driverId },
        data: { status: 'AVAILABLE' }
      });
    }

    return cancelledTrip;
  });
};

/**
 * Retrieves a single Trip by ID
 */
export const getTripById = async (id) => {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      vehicle: true,
      driver: true,
      dispatcher: {
        select: { id: true, email: true, name: true }
      }
    }
  });

  if (!trip) {
    throw ApiError.notFound('Trip not found.');
  }

  return trip;
};

/**
 * Lists Trips with pagination and filters
 */
export const listTrips = async ({ status, vehicleId, driverId, page, limit }) => {
  const whereClause = {};

  if (status) {
    whereClause.status = status;
  }
  if (vehicleId) {
    whereClause.vehicleId = vehicleId;
  }
  if (driverId) {
    whereClause.driverId = driverId;
  }

  const skip = (page - 1) * limit;

  const [trips, total] = await Promise.all([
    prisma.trip.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        vehicle: true,
        driver: true,
        dispatcher: {
          select: { id: true, email: true, name: true }
        }
      }
    }),
    prisma.trip.count({ where: whereClause })
  ]);

  return {
    trips,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};
