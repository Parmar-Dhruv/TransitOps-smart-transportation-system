import { z } from 'zod';

/**
 * Validation schema for registering a new driver
 */
export const createDriverSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Driver name is required.'),
    email: z.string().email('Invalid email address format.'),
    phone: z.string().trim().min(1, 'Phone number is required.'),
    licenseNumber: z.string().trim().min(3, 'License number must be at least 3 characters.'),
    licenseExpiry: z.string().datetime({ message: 'License expiry must be a valid ISO-8601 datetime string.' }),
    safetyScore: z.coerce.number()
      .min(0, 'Safety score must be between 0 and 100.')
      .max(100, 'Safety score must be between 0 and 100.')
      .optional(),
    status: z.enum(['AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED']).optional(),
    userId: z.string().uuid('Invalid user ID format.').optional()
  }).strict()
});

/**
 * Validation schema for updating driver profile details
 */
export const updateDriverSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid driver ID format.')
  }).strict(),
  body: z.object({
    name: z.string().trim().min(1).optional(),
    email: z.string().email('Invalid email format.').optional(),
    phone: z.string().trim().min(1).optional(),
    licenseNumber: z.string().trim().min(3).optional(),
    licenseExpiry: z.string().datetime({ message: 'Must be a valid ISO-8601 datetime string.' }).optional(),
    safetyScore: z.coerce.number().min(0).max(100).optional(),
    status: z.enum(['AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED']).optional(),
    userId: z.string().uuid().optional()
  }).strict()
});

/**
 * Validation schema for driver query params (ID)
 */
export const getDriverSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid driver ID format.')
  }).strict()
});

/**
 * Validation schema for listing drivers with filters & pagination
 */
export const listDriversSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.enum(['AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED']).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10)
  }).strict()
});
