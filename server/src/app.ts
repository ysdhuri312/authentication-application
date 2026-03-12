/** @format */

import express from 'express';
import type { Request, Response } from 'express';

const app = express();

app.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'API Running',
    version: 1.0,
  });
});

export default app;
