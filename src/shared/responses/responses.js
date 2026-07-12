/**
 * Standard success response helper
 */
export const successResponse = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data: data || {}
  });
};

/**
 * Standard error response helper
 */
export const errorResponse = (res, statusCode, message, data = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data
  });
};
