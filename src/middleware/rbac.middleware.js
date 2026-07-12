import { prisma } from '../config/db.js';
import { ApiError } from '../shared/errors/apiError.js';

/**
 * Middleware to check if the authenticated user has one of the allowed roles.
 * Always verifies the role from the database to prevent outdated JWT claims from bypassing security.
 */
export const authorize = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return next(ApiError.unauthorized('Authentication context is missing.'));
      }

      // Direct database verification
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { role: true, isActive: true }
      });

      if (!user) {
        return next(ApiError.unauthorized('Account not found.'));
      }

      if (!user.isActive) {
        return next(ApiError.unauthorized('Account is deactivated.'));
      }

      if (!allowedRoles.includes(user.role)) {
        return next(ApiError.forbidden('Access denied. Insufficient privileges to access this resource.'));
      }

      // Update context role to match current database state
      req.user.role = user.role;

      return next();
    } catch (error) {
      return next(error);
    }
  };
};
