/** @format */

import { ErrorRequestHandler } from 'express';

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || 'Internal Server Error';

  res.status(err.statusCode).json({
    status: false,
    message: err.message,
    timestamp: new Date().toISOString(),
    stack: process.env.NODE_ENV === 'dev' ? err.stack : null,
  });
};

export default errorHandler;
