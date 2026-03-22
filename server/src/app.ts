/** @format */

import express from 'express';
import type { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';

import { connectDB } from './config/db';

import authRouter from './routes/v1/auth.route';
import dashboardRouter from './routes/v1/dashboard.route';

import errorHandler from './handlers/error';

const app = express();
connectDB();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }),
);

app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Welcome to API v1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/dashboard', dashboardRouter);

app.use(errorHandler);

export default app;
