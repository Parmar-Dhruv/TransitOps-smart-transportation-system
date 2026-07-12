import app from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(`🚀 Server initialized in "${env.NODE_ENV}" mode, listening on port ${PORT}`);
});

// Handle unhandled Promise rejections safely
process.on('unhandledRejection', (error) => {
  logger.error('❌ Critical unhandled promise rejection encountered. Triggering server shutdown...', error);
  server.close(() => {
    process.exit(1);
  });
});
