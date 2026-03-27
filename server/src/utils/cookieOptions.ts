/** @format */

import { env } from '../config/env';

type CookieObject = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  maxAge?: number;
};

export const cookieOptions: CookieObject = {
  httpOnly: true,
  secure: env.NODE_ENV === 'dev' ? false : true,
  sameSite: env.NODE_ENV === 'dev' ? 'lax' : 'strict',
};
