/** @format */

import app from './app';
import { disconnectDB } from './config/db';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// handle promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhadled Rejection: ', error);
  server.close(async () => {
    await disconnectDB();
  });
  process.exit(1);
});

// handled try_catch errors
process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception: ', error);
  await disconnectDB();
  process.exit(1);
});

// SIGTERM received, Gracefully shutdown.
process.on('SIGTERM', () => {
  console.error('SIGTERM Received, Server shutting down gracefully');
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
});

// SIGINT received (Ctrl+C), Gracefully shutdown.
process.on('SIGINT', () => {
  console.error('SIGINT Received, Server shutting down gracefully');
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
});
