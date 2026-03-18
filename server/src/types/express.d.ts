/** @format */

import { jwtPayload } from './types/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: jwtPayload;
    }
  }
}

export {};
