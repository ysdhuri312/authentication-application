/** @format */

import express from 'express';
import type { Request, Response } from 'express';
import 'dotenv/config';
import { connectDB } from './config/db';

import authRouter from './routes/v1/auth.route';
import errorHandler from './handlers/error';

const app = express();
connectDB();

// Middlewares
app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Welcome to API v1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/v1/auth', authRouter);

app.use(errorHandler);

export default app;
