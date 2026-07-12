import { env } from './env.js';

const levels = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

const formatMessage = (level, message, meta) => {
  const timestamp = new Date().toISOString();
  const metaStr = meta && Object.keys(meta).length > 0 ? ` | Meta: ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] [${level}]: ${message}${metaStr}`;
};

export const logger = {
  info: (message, meta = {}) => {
    console.log(formatMessage(levels.INFO, message, meta));
  },
  warn: (message, meta = {}) => {
    console.warn(formatMessage(levels.WARN, message, meta));
  },
  error: (message, error = null, meta = {}) => {
    let errorDetails = { ...meta };
    if (error instanceof Error) {
      errorDetails.errorMsg = error.message;
      if (env.NODE_ENV !== 'production') {
        errorDetails.stack = error.stack;
      }
    } else if (error) {
      errorDetails.error = error;
    }
    console.error(formatMessage(levels.ERROR, message, errorDetails));
  },
  debug: (message, meta = {}) => {
    if (env.NODE_ENV !== 'production') {
      console.log(formatMessage(levels.DEBUG, message, meta));
    }
  }
};
