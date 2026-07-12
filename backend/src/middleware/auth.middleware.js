import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../config/db.js';
import { ApiError } from '../shared/errors/apiError.js';

/**
 * Middleware to authenticate requests using JWT
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(ApiError.unauthorized('Access denied. No authorization token provided.'));
    }

    const token = authHeader.split(' ')[1];
    
    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      return next(ApiError.unauthorized('Access denied. Invalid or expired signature.'));
    }

    // Fetch from database to ensure database validation (Never trust token state)
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return next(ApiError.unauthorized('Access denied. Registered account not found.'));
    }

    if (!user.isActive) {
      return next(ApiError.unauthorized('Access denied. Account is deactivated.'));
    }

    // Attach clean user context to the request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    return next();
  } catch (error) {
    return next(error);
  }
};
