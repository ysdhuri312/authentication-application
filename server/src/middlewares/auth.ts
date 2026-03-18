/** @format */

import asynError from '../handlers/asyncError';
import CustomErrorHandler from '../handlers/CustomError';
import { jwtPayload } from '../types/jwt';
import { verifyAccessToken } from '../utils/token';

export const isAuthorized = asynError(async (req, _res, next) => {
  const token = req.headers['access_token'] as string;
  if (!token) throw new CustomErrorHandler(401, 'Unauthorized');

  const payload: jwtPayload = verifyAccessToken(token);
  if (!payload) throw new CustomErrorHandler(403, 'Token revoked');

  req.user = payload;

  next();
});
