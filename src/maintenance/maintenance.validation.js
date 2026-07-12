import { z } from 'zod';

/**
 * Validation schema for scheduling a maintenance log
 */
export const createMaintenanceSchema = z.object({
  body: z.object({
    vehicleId: z.string().uuid('Invalid vehicle ID format.'),
    description: z.string().trim().min(3, 'Maintenance description is required (min 3 chars).'),
    cost: z.coerce.number().nonnegative('Cost cannot be negative.'),
    status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED']).optional(),
    startDate: z.string().datetime({ message: 'Start date must be a valid ISO-8601 datetime string.' }),
    endDate: z.string().datetime().optional()
  }).strict()
});

/**
 * Validation schema for updating maintenance log details
 */
export const updateMaintenanceSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid maintenance log ID format.')
  }).strict(),
  body: z.object({
    description: z.string().trim().min(3).optional(),
    cost: z.coerce.number().nonnegative().optional(),
    status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED']).optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional()
  }).strict()
});

/**
 * Validation schema for log identifiers
 */
export const getMaintenanceSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid maintenance log ID format.')
  }).strict()
});

/**
 * Validation schema for listing maintenance logs
 */
export const listMaintenanceSchema = z.object({
  query: z.object({
    vehicleId: z.string().uuid('Invalid vehicle ID.').optional(),
    status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED']).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10)
  }).strict()
});
