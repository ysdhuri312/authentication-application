/** @format */

import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { jwtPayload } from '../types/jwt';

export const creatAccessToken = (payload: jwtPayload) => {
  const token = jwt.sign(payload, env.JWT_ACCESS_TOKEN, {
    expiresIn: '30m',
  });
  return token;
};

export const creatRefreshToken = (payload: jwtPayload) => {
  const token = jwt.sign(payload, env.JWT_REFRESH_TOKEN, { expiresIn: '7d' });
  return token;
};
