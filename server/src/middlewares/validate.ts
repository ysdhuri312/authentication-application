/** @format */

import { ZodObject } from 'zod';
import { Request, Response, NextFunction } from 'express';
import CustomErrorHandler from '../handlers/CustomError';

const validate =
  (schema: ZodObject) => (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      throw new CustomErrorHandler(
        400,
        result.error.issues.map((err) => err.message).join('. '),
      );
    } else {
      req.body = result.data;
      next();
    }
  };

export default validate;
