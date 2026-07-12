import { prisma } from '../config/db.js';
import { logger } from '../config/logger.js';

/**
 * Express middleware to automatically log audit trials for state-changing routes
 */
export const auditLogger = (actionDescription, entityName = null) => {
  return async (req, res, next) => {
    const originalJson = res.json;

    res.json = function (data) {
      res.json = originalJson;
      const resSent = res.json(data);

      try {
        const userId = req.user ? req.user.id : null;
        const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];

        // Only audit logs for successful state mutations (POST, PUT, DELETE, PATCH)
        if (req.method !== 'GET' && res.statusCode >= 200 && res.statusCode < 300) {
          const entityId = req.params.id || data?.data?.id || null;

          // Scrub sensitive data before logging
          const payload = { ...req.body };
          if (payload.password) payload.password = '[REDACTED]';

          prisma.auditLog.create({
            data: {
              userId,
              action: actionDescription || `${req.method} ${req.baseUrl}${req.path}`,
              entityName,
              entityId: entityId ? String(entityId) : null,
              details: JSON.stringify({
                method: req.method,
                path: req.originalUrl,
                body: payload,
                params: req.params,
                query: req.query
              }),
              ipAddress,
              userAgent
            }
          }).catch((err) => {
            logger.error('Failed to async write audit log:', err);
          });
        }
      } catch (err) {
        logger.error('Audit logger middleware capture error:', err);
      }

      return resSent;
    };

    return next();
  };
};

/**
 * Utility helper to manually write audit records.
 * Can be run within Prisma Transactions by passing the transaction client instance.
 */
export const recordAuditLog = async (prismaClient, { userId, action, entityName, entityId, details, req }) => {
  try {
    const db = prismaClient || prisma;
    let ipAddress = null;
    let userAgent = null;

    if (req) {
      ipAddress = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
      userAgent = req.headers['user-agent'];
    }

    const log = await db.auditLog.create({
      data: {
        userId,
        action,
        entityName,
        entityId: entityId ? String(entityId) : null,
        details: typeof details === 'object' ? JSON.stringify(details) : details,
        ipAddress,
        userAgent
      }
    });
    return log;
  } catch (error) {
    logger.error(`Failed to record audit log: ${action}`, error);
    return null;
  }
};
