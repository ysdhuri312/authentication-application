/** @format */

import { Prisma } from '@prisma/client';
import { ErrorRequestHandler } from 'express';
import CustomErrorHandler from './CustomError';

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Email already register
    if (err.code === 'P2002') {
      const message = 'User already register, Please log in or forgot password';
      err = new CustomErrorHandler(406, message);
    }
  }
  res.status(err.statusCode).json({
    success: false,
    message: err.message,
    timestamp: new Date().toISOString(),
    stack: process.env.NODE_ENV === 'dev' ? err.stack : null,
  });
};

export default errorHandler;
