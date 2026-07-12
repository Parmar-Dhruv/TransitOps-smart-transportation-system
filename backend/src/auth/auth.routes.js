import { Router } from 'express';
import * as authController from './auth.controller.js';
import { loginSchema, registerUserSchema } from './auth.validation.js';
import { validate } from '../middleware/validate.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorize } from '../middleware/rbac.middleware.js';
import { auditLogger } from '../middleware/audit.middleware.js';

const router = Router();

// Public route - Login
router.post(
  '/login', 
  validate(loginSchema), 
  auditLogger('User Login Operation', 'User'), 
  authController.login
);

// Protected route - Logout
router.post(
  '/logout', 
  authenticate, 
  auditLogger('User Logout Operation', 'User'), 
  authController.logout
);

// Protected route - Current User Profile
router.get(
  '/me', 
  authenticate, 
  authController.getMe
);

// Admin-only route - Register new portal users
router.post(
  '/register-user', 
  authenticate, 
  authorize('ADMIN'), 
  validate(registerUserSchema), 
  auditLogger('Create New Portal User', 'User'), 
  authController.registerUser
);

export default router;
