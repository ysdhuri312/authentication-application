/** @format */

import express from 'express';
import type { Request, Response } from 'express';
import 'dotenv/config';
import { connectDB } from './config/db';

const app = express();
connectDB();

app.get('/', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'API Running',
    version: 1.0,
  });
});

export default app;
