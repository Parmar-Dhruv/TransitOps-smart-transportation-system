import { z } from 'zod';

/**
 * Schema validation for Login endpoint
 * Rejects unknown properties in body.
 */
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address format.'),
    password: z.string().min(6, 'Password must be at least 6 characters long.'),
    rememberMe: z.boolean().optional()
  }).strict()
});

/**
 * Schema validation for user creation (Admin only)
 * Rejects unknown properties in body.
 */
export const registerUserSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address format.'),
    password: z.string().min(8, 'Password must be at least 8 characters long.'),
    name: z.string().min(1, 'Full name is required.'),
    role: z.enum(['ADMIN', 'FLEET_MANAGER', 'DISPATCHER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'], {
      errorMap: () => ({ message: 'Invalid role specified. Must be one of: ADMIN, FLEET_MANAGER, DISPATCHER, SAFETY_OFFICER, FINANCIAL_ANALYST.' })
    }),
    phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format.').optional()
  }).strict()
});
