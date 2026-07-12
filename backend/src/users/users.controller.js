import * as usersService from './users.service.js';
import { handleProfileUpload } from '../middleware/upload.middleware.js';
import { successResponse } from '../shared/responses/responses.js';
import { ApiError } from '../shared/errors/apiError.js';

export const getProfile = async (req, res, next) => {
  try {
    const profile = await usersService.getProfile(req.user.id);
    return successResponse(res, 200, 'User profile retrieved successfully.', profile);
  } catch (error) {
    return next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const updated = await usersService.updateProfile(req.user.id, req.body);
    return successResponse(res, 200, 'User profile updated successfully.', updated);
  } catch (error) {
    return next(error);
  }
};

export const uploadPhoto = async (req, res, next) => {
  try {
    const file = await handleProfileUpload(req, res);
    if (!file) {
      throw ApiError.badRequest('No image file provided for upload.');
    }
    const result = await usersService.updatePhoto(req.user.id, file);
    return successResponse(res, 200, 'Profile photo uploaded successfully.', result);
  } catch (error) {
    return next(error);
  }
};

export const deletePhoto = async (req, res, next) => {
  try {
    const result = await usersService.deletePhoto(req.user.id);
    return successResponse(res, 200, 'Profile photo removed successfully.', result);
  } catch (error) {
    return next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await usersService.changePassword(req.user.id, currentPassword, newPassword);
    return successResponse(res, 200, 'Password updated successfully.');
  } catch (error) {
    return next(error);
  }
};
