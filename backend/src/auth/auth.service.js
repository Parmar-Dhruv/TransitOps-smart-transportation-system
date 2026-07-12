import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';
import { ApiError } from '../shared/errors/apiError.js';

/**
 * Handles user login logic
 */
export const loginUser = async (email, password) => {
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw ApiError.unauthorized('Invalid email or password credentials.');
  }

  if (!user.isActive) {
    throw ApiError.unauthorized('This account is deactivated. Please contact support.');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw ApiError.unauthorized('Invalid email or password credentials.');
  }

  // Sign standard payload
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  };
};

/**
 * Creates a new user record inside the database (Admin only privilege)
 */
export const registerUser = async (userData) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email }
  });

  if (existingUser) {
    throw ApiError.badRequest('An account with this email is already registered.');
  }

  const hashedPassword = await bcrypt.hash(userData.password, 12);

  const user = await prisma.user.create({
    data: {
      email: userData.email,
      password: hashedPassword,
      name: userData.name,
      role: userData.role,
      phone: userData.phone || null,
      isActive: true
    }
  });

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
    isActive: user.isActive,
    createdAt: user.createdAt
  };
};

/**
 * Retrieves the profile details for a given user ID
 */
export const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id }
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
