import { PrismaClient } from '@prisma/client';
import { logger } from './logger.js';
import { env } from './env.js';

export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
});

// Test the connection on module load
prisma.$connect()
  .then(() => {
    logger.info('🔌 Database connection established successfully via Prisma Client');
  })
  .catch((error) => {
    logger.error('❌ Failed to connect to the database:', error);
  });

// Graceful shutdown handling
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  logger.info('🔌 Database connection closed via Prisma Client on process terminate');
  process.exit(0);
});
