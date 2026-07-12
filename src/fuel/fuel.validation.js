import { z } from 'zod';

/**
 * Validation schema for registering a refuel log
 */
export const createFuelSchema = z.object({
  body: z.object({
    vehicleId: z.string().uuid('Invalid vehicle ID format.'),
    driverId: z.string().uuid('Invalid driver ID format.'),
    liters: z.coerce.number().positive('Liters must be a positive number.'),
    costPerLiter: z.coerce.number().nonnegative('Cost per liter cannot be negative.'),
    odometer: z.coerce.number().nonnegative('Odometer reading cannot be negative.'),
    refuelDate: z.string().datetime({ message: 'Refuel date must be a valid ISO-8601 datetime string.' })
  }).strict()
});

/**
 * Validation schema for updating fuel log details
 */
export const updateFuelSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid fuel log ID format.')
  }).strict(),
  body: z.object({
    liters: z.coerce.number().positive().optional(),
    costPerLiter: z.coerce.number().nonnegative().optional(),
    odometer: z.coerce.number().nonnegative().optional(),
    refuelDate: z.string().datetime().optional()
  }).strict()
});

/**
 * Validation schema for log query identifiers
 */
export const getFuelSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid fuel log ID format.')
  }).strict()
});

/**
 * Validation schema for listing fuel logs with pagination
 */
export const listFuelSchema = z.object({
  query: z.object({
    vehicleId: z.string().uuid('Invalid vehicle ID.').optional(),
    driverId: z.string().uuid('Invalid driver ID.').optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10)
  }).strict()
});
