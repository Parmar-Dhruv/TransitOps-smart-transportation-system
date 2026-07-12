import { z } from 'zod';

/**
 * Validation schema for creating a new Trip in DRAFT state
 */
export const createTripSchema = z.object({
  body: z.object({
    vehicleId: z.string().uuid('Invalid vehicle ID format.'),
    driverId: z.string().uuid('Invalid driver ID format.'),
    cargoWeight: z.coerce.number().positive('Cargo weight must be a positive number.'),
    startOdometer: z.coerce.number().nonnegative('Start odometer must be a non-negative number.'),
    routeDetails: z.string().trim().optional()
  }).strict()
});

/**
 * Validation schema for dispatching a DRAFT trip
 */
export const dispatchTripSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid trip ID format.')
  }).strict()
});

/**
 * Validation schema for completing an active trip
 */
export const completeTripSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid trip ID format.')
  }).strict(),
  body: z.object({
    endOdometer: z.coerce.number().nonnegative('End odometer reading must be non-negative.'),
    endTime: z.string().datetime({ message: 'Must be a valid ISO-8601 date string.' }).optional(),
    fuelUsed: z.coerce.number().positive('Fuel used must be a positive quantity.'),
    revenue: z.coerce.number().positive('Revenue generated must be a positive amount.')
  }).strict()
});

/**
 * Validation schema for cancelling a trip
 */
export const cancelTripSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid trip ID format.')
  }).strict(),
  body: z.object({
    cancelReason: z.string().trim().min(3, 'Cancel reason must be at least 3 characters.')
  }).strict()
});

/**
 * Validation schema for individual trip fetch params
 */
export const getTripSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid trip ID format.')
  }).strict()
});

/**
 * Validation schema for listing trips
 */
export const listTripsSchema = z.object({
  query: z.object({
    status: z.enum(['DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED']).optional(),
    vehicleId: z.string().uuid('Invalid vehicle ID.').optional(),
    driverId: z.string().uuid('Invalid driver ID.').optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10)
  }).strict()
});
