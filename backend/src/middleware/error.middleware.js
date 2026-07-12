import { logger } from '../config/logger.js';
import { env } from '../config/env.js';
import { ApiError } from '../shared/errors/apiError.js';

export const errorHandler = (error, req, res, next) => {
  let statusCode = 500;
  let message = 'Internal server error';
  let data = null;

  // Handle custom ApiError instances
  if (error instanceof ApiError) {
    statusCode = error.statusCode;
    message = error.message;
    data = error.data;
  } 
  // Handle Zod or general validation exceptions directly if passed
  else if (error.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation failed';
    data = error.errors;
  } 
  // Handle database constraints / Prisma errors
  else if (error.code && error.code.startsWith('P')) {
    logger.error('Prisma operation failed:', error, { path: req.path, method: req.method });
    statusCode = 400;
    message = 'Database transaction or constraint error';
    if (env.NODE_ENV === 'development') {
      data = {
        code: error.code,
        meta: error.meta,
        message: error.message
      };
    }
  } 
  // Default unhandled exceptions
  else {
    logger.error('Unhandled runtime error:', error, { path: req.path, method: req.method });
    if (env.NODE_ENV === 'production') {
      message = 'An unexpected error occurred';
    } else {
      message = error.message || 'An unexpected error occurred';
    }
  }

  const responseBody = {
    success: false,
    message,
    data
  };

  // Attach stack trace only in non-production environments for troubleshooting
  if (env.NODE_ENV !== 'production' && !(error instanceof ApiError)) {
    responseBody.stack = error.stack;
  }

  return res.status(statusCode).json(responseBody);
};
