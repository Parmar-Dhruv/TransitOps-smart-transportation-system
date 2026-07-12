import { Router } from 'express';
import * as usersController from './users.controller.js';
import { updateProfileSchema, changePasswordSchema } from './users.validation.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Retrieve own profile
router.get(
  '/profile',
  authenticate,
  usersController.getProfile
);

// Update details
router.patch(
  '/profile',
  authenticate,
  validate(updateProfileSchema),
  usersController.updateProfile
);

// Upload or replace photo
router.post(
  '/profile/photo',
  authenticate,
  usersController.uploadPhoto
);

// Delete photo
router.delete(
  '/profile/photo',
  authenticate,
  usersController.deletePhoto
);

// Change password
router.patch(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  usersController.changePassword
);

export default router;
