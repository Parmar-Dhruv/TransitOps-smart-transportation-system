import { z } from 'zod';

/**
 * Validation schema for creating a new vehicle
 */
export const createVehicleSchema = z.object({
  body: z.object({
    registrationNumber: z.string()
      .trim()
      .min(3, 'Registration number must be at least 3 characters.')
      .max(15, 'Registration number cannot exceed 15 characters.'),
    make: z.string().trim().min(1, 'Make is required.'),
    model: z.string().trim().min(1, 'Model is required.'),
    year: z.coerce.number()
      .int()
      .min(1900, 'Year must be 1900 or later.')
      .max(new Date().getFullYear() + 2, 'Invalid vehicle model year.'),
    capacity: z.coerce.number().positive('Capacity must be a positive number.'),
    odometer: z.coerce.number().nonnegative('Odometer reading cannot be negative.'),
    status: z.enum(['AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED']).optional()
  }).strict()
});

/**
 * Validation schema for updating an existing vehicle
 */
export const updateVehicleSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid vehicle ID format.')
  }).strict(),
  body: z.object({
    registrationNumber: z.string().trim().min(3).max(15).optional(),
    make: z.string().trim().min(1).optional(),
    model: z.string().trim().min(1).optional(),
    year: z.coerce.number().int().min(1900).max(new Date().getFullYear() + 2).optional(),
    capacity: z.coerce.number().positive('Capacity must be positive.').optional(),
    odometer: z.coerce.number().nonnegative('Odometer reading cannot be negative.').optional(),
    status: z.enum(['AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED']).optional()
  }).strict()
});

/**
 * Validation schema for parameters of get or delete operations
 */
export const getVehicleSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid vehicle ID format.')
  }).strict()
});

/**
 * Validation schema for listing vehicles with pagination & filters
 */
export const listVehiclesSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.enum(['AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED']).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10)
  }).strict()
});
