import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import { prisma } from '../config/db.js';
import { ApiError } from '../shared/errors/apiError.js';

// Resolve uploads directory for physical file manipulation
const uploadsDir = new URL('../../uploads/profile-images', import.meta.url).pathname;

/**
 * Clean path helper to prevent path traversal
 */
const safeDeleteFile = (relativePath) => {
  if (!relativePath) return;
  const fileName = path.basename(relativePath);
  const fullPath = path.join(uploadsDir, fileName);
  
  if (fs.existsSync(fullPath)) {
    try {
      fs.unlinkSync(fullPath);
    } catch (err) {
      console.error(`Failed to delete profile image: ${fullPath}`, err);
    }
  }
};

/**
 * Retrieve clean profile details by User ID
 */
export const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw ApiError.notFound('Account not found.');
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    profileImage: user.profileImage,
    department: user.department,
    designation: user.designation,
    isActive: user.isActive,
    createdAt: user.createdAt
  };
};

/**
 * Update user parameters (name, phone, department, designation)
 */
export const updateProfile = async (userId, data) => {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: data.name,
      phone: data.phone === undefined ? undefined : data.phone,
      department: data.department === undefined ? undefined : data.department,
      designation: data.designation === undefined ? undefined : data.designation
    }
  });

  return {
    id: updatedUser.id,
    email: updatedUser.email,
    name: updatedUser.name,
    role: updatedUser.role,
    phone: updatedUser.phone,
    profileImage: updatedUser.profileImage,
    department: updatedUser.department,
    designation: updatedUser.designation,
    isActive: updatedUser.isActive
  };
};

/**
 * Update user's profile photo
 */
export const updatePhoto = async (userId, file) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw ApiError.notFound('Account not found.');
  }

  // Remove existing photo if present
  if (user.profileImage) {
    safeDeleteFile(user.profileImage);
  }

  // Store new path relative to backend root or uploads alias
  const relativePath = `/uploads/profile-images/${file.filename}`;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { profileImage: relativePath }
  });

  return {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    profileImage: updatedUser.profileImage
  };
};

/**
 * Delete profile photo
 */
export const deletePhoto = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw ApiError.notFound('Account not found.');
  }

  if (user.profileImage) {
    safeDeleteFile(user.profileImage);
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { profileImage: null }
  });

  return {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    profileImage: null
  };
};

/**
 * Change account password
 */
export const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw ApiError.notFound('Account not found.');
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw ApiError.badRequest('Invalid current password provided.');
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword }
  });

  return { success: true };
};
