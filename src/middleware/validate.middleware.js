import { ApiError } from '../shared/errors/apiError.js';

/**
 * Validates request data (body, params, query) against a Zod schema.
 * Rejects requests with unknown/unexpected fields by enforcing strict parsing on the schemas.
 */
export const validate = (schema) => (req, res, next) => {
  try {
    const dataToValidate = {};
    
    if (schema.shape.body) {
      dataToValidate.body = req.body;
    }
    if (schema.shape.params) {
      dataToValidate.params = req.params;
    }
    if (schema.shape.query) {
      dataToValidate.query = req.query;
    }

    const validated = schema.parse(dataToValidate);

    // Replace req parameters with parsed and validated parameters (strips/validates types)
    if (schema.shape.body) {
      req.body = validated.body;
    }
    if (schema.shape.params) {
      req.params = validated.params;
    }
    if (schema.shape.query) {
      req.query = validated.query;
    }

    return next();
  } catch (error) {
    if (error.name === 'ZodError') {
      const formattedErrors = error.errors.map((err) => ({
        location: err.path[0], // 'body' | 'params' | 'query'
        field: err.path.slice(1).join('.'),
        message: err.message
      }));
      return next(new ApiError(400, 'Invalid request input parameters', formattedErrors));
    }
    return next(error);
  }
};
