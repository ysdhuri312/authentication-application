/** @format */

import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'dev' ? ['error', 'query', 'warn'] : ['error'],
  adapter,
});

export const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('Database connencted successfully');
  } catch (err) {
    if (err instanceof Error) {
      console.error('Database connection error: ', err.message);
      process.exit(1);
    } else {
      console.error('Unknown error: ', err);
      process.exit(1);
    }
  }
};

export const disconnectDB = async () => {
  await prisma.$disconnect();
};
