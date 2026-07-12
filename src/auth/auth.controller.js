import * as authService from './auth.service.js';
import { successResponse } from '../shared/responses/responses.js';

/**
 * Handles user login request
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const data = await authService.loginUser(email, password);
    return successResponse(res, 200, 'Login successful.', data);
  } catch (error) {
    return next(error);
  }
};

/**
 * Handles user logout request
 */
export const logout = async (req, res, next) => {
  try {
    // Stateless JWT logouts are handled on client side, but we acknowledge it
    return successResponse(res, 200, 'Logged out successfully. Please purge auth tokens client-side.');
  } catch (error) {
    return next(error);
  }
};

/**
 * Retrieves the currently logged in user context
 */
export const getMe = async (req, res, next) => {
  try {
    const userProfile = await authService.getUserById(req.user.id);
    return successResponse(res, 200, 'User profile retrieved successfully.', userProfile);
  } catch (error) {
    return next(error);
  }
};

/**
 * Creates a new portal user account (Admin only)
 */
export const registerUser = async (req, res, next) => {
  try {
    const newUser = await authService.registerUser(req.body);
    return successResponse(res, 201, 'New user account created successfully.', newUser);
  } catch (error) {
    return next(error);
  }
};
