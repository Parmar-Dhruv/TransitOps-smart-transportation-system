import { z } from 'zod';

/**
 * Validation schema for recording a new ledger expense
 */
export const createExpenseSchema = z.object({
  body: z.object({
    vehicleId: z.string().uuid('Invalid vehicle ID format.').optional().nullable(),
    tripId: z.string().uuid('Invalid trip ID format.').optional().nullable(),
    driverId: z.string().uuid('Invalid driver ID format.').optional().nullable(),
    amount: z.coerce.number().positive('Expense amount must be a positive value.'),
    category: z.enum([
      'TOLL', 'PARKING', 'DRIVER_ALLOWANCE', 'REPAIR', 'MAINTENANCE', 'INSURANCE', 'PERMIT', 'FINE', 'MISCELLANEOUS'
    ], {
      errorMap: () => ({ message: 'Invalid category. Must be one of: TOLL, PARKING, DRIVER_ALLOWANCE, REPAIR, MAINTENANCE, INSURANCE, PERMIT, FINE, MISCELLANEOUS.' })
    }),
    date: z.string().datetime({ message: 'Date must be a valid ISO-8601 datetime string.' }),
    description: z.string().trim().min(3, 'Expense description is required.')
  }).strict()
});

/**
 * Validation schema for updating expense log details
 */
export const updateExpenseSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid expense ID format.')
  }).strict(),
  body: z.object({
    amount: z.coerce.number().positive('Amount must be positive.').optional(),
    category: z.enum([
      'TOLL', 'PARKING', 'DRIVER_ALLOWANCE', 'REPAIR', 'MAINTENANCE', 'INSURANCE', 'PERMIT', 'FINE', 'MISCELLANEOUS'
    ]).optional(),
    date: z.string().datetime().optional(),
    description: z.string().trim().min(3).optional()
  }).strict()
});

/**
 * Validation schema for log query identifiers
 */
export const getExpenseSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid expense ID format.')
  }).strict()
});

/**
 * Validation schema for listing ledger expenses with pagination
 */
export const listExpenseSchema = z.object({
  query: z.object({
    vehicleId: z.string().uuid('Invalid vehicle ID.').optional(),
    tripId: z.string().uuid('Invalid trip ID.').optional(),
    driverId: z.string().uuid('Invalid driver ID.').optional(),
    category: z.enum([
      'TOLL', 'PARKING', 'DRIVER_ALLOWANCE', 'REPAIR', 'MAINTENANCE', 'INSURANCE', 'PERMIT', 'FINE', 'MISCELLANEOUS'
    ]).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10)
  }).strict()
});
