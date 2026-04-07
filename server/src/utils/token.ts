/** @format */

import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { jwtPayload } from '../types/jwt';
import CustomErrorHandler from '../handlers/CustomError';
import crypto from 'crypto';

export const creatAccessToken = (payload: jwtPayload) => {
  const token = jwt.sign(payload, env.JWT_ACCESS_TOKEN, {
    expiresIn: '15m',
  });
  return token;
};

export const creatRefreshToken = (payload: jwtPayload) => {
  const token = jwt.sign(payload, env.JWT_REFRESH_TOKEN, { expiresIn: '7d' });
  return token;
};

export const verifyRefreshToken = (token: string): jwtPayload => {
  try {
    const { id, userEmail, role } = jwt.verify(
      token,
      env.JWT_REFRESH_TOKEN,
    ) as jwtPayload;

    return { id, userEmail, role };
  } catch (err) {
    throw new CustomErrorHandler(401, 'Invalid refresh token');
  }
};

export const verifyAccessToken = (token: string): jwtPayload => {
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_TOKEN) as jwtPayload;
    return payload;
  } catch (err) {
    throw new CustomErrorHandler(401, 'Invalid access token');
  }
};

export const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const hashToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
