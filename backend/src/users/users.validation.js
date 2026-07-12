import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, 'Name is required.').optional(),
    phone: z.string().trim().optional().nullable(),
    department: z.string().trim().optional().nullable(),
    designation: z.string().trim().optional().nullable()
  }).strict()
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required.'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters.'),
    confirmPassword: z.string().min(1, 'Confirm password is required.')
  }).strict().refine(data => data.newPassword === data.confirmPassword, {
    message: 'New password and confirm password do not match.',
    path: ['confirmPassword']
  })
});
