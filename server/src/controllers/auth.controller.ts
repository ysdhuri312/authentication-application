/** @format */

import asynError from '../handlers/asyncError';
import { Request } from 'express';
import {
  authHeaderSchema,
  loginDTO,
  RegisterDTO,
} from '../schemas/auth.schema';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';
import {
  creatAccessToken,
  creatRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
} from '../utils/token';
import CustomErrorHandler from '../handlers/CustomError';
import { cookieOptions } from '../utils/cookieOptions';
import { env } from '../config/env';
import crypto from 'crypto';
import { emailVerify } from '../services/emailVerification';

export const register = asynError(
  async (req: Request<{}, {}, RegisterDTO>, res) => {
    const { fullname, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullname,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        fullname: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const { id, email: userEmail, role } = user;
    const payload = {
      id,
      userEmail,
      role,
    };

    const accessToken = creatAccessToken(payload);
    const refreshToken = creatRefreshToken(payload);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: id,
        expireAt: new Date(Date.now() + env.REFRESH_TOKEN_EXPIRY),
      },
    });

    const emailVerificationToken = crypto.randomBytes(32).toString('hex');

    await prisma.user.update({
      where: { email },
      data: {
        emailVerifyToken: emailVerificationToken,
        emailTokenExpiry: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await emailVerify(emailVerificationToken, email);

    res
      .status(201)
      .cookie('access_token', `Bearer ${accessToken}`, {
        ...cookieOptions,
        maxAge: env.ACCESS_TOKEN_EXPIRY,
      })
      .cookie('refresh_token', `Bearer ${refreshToken}`, {
        ...cookieOptions,
        maxAge: env.REFRESH_TOKEN_EXPIRY,
      })
      .json({
        success: true,
        messsage: 'User register successfully',
        user,
        accessToken, //REMOVE
        refreshToken, //REMOVE
      });
  },
);

export const login = asynError(async (req: Request<{}, {}, loginDTO>, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) throw new CustomErrorHandler(401, 'User not register');

  const userAuthenticated = await bcrypt.compare(
    password,
    user.password as string,
  );

  if (!userAuthenticated)
    throw new CustomErrorHandler(401, 'Invalid credential');

  const { id, fullname, email: userEmail, role, createdAt } = user;

  const payload = { id, userEmail, role };

  const accessToken = creatAccessToken(payload);
  const refreshToken = creatRefreshToken(payload);

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: id,
      expireAt: new Date(Date.now() + env.REFRESH_TOKEN_EXPIRY),
    },
  });

  res
    .status(200)
    .cookie('access_token', `Bearer ${accessToken}`, {
      ...cookieOptions,
      maxAge: env.ACCESS_TOKEN_EXPIRY,
    })
    .cookie('refresh_token', `Bearer ${refreshToken}`, {
      ...cookieOptions,
      maxAge: env.REFRESH_TOKEN_EXPIRY,
    })
    .json({
      success: true,
      messsage: 'User login successfully',
      user: { fullname, email: userEmail, role, createdAt },
      accessToken, //REMOVE
      refreshToken, //REMOVE
    });
});

export const refreshToken = asynError(async (req, res) => {
  if (!req.headers['refresh_token'])
    throw new CustomErrorHandler(401, 'Unauthorized');

  let refreshToken = authHeaderSchema.safeParse(req.headers['refresh_token']);
  if (!refreshToken.success)
    throw new CustomErrorHandler(401, 'Invalid authorization header');

  await prisma.refreshToken.findUnique({
    where: { token: refreshToken.data },
  });

  const payload = verifyRefreshToken(refreshToken.data);
  if (!payload) throw new CustomErrorHandler(403, 'Token revoked');

  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user) throw new CustomErrorHandler(403, 'Unauthorized');

  await prisma.refreshToken.deleteMany({ where: { userId: payload.id } });

  const { id, email, role } = user;
  const newAccessToken = creatAccessToken({ id, userEmail: email, role });
  const newRefreshToken = creatRefreshToken({ id, userEmail: email, role });

  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: id,
      expireAt: new Date(Date.now() + env.REFRESH_TOKEN_EXPIRY),
    },
  });

  res
    .status(200)
    .cookie('access_token', `Bearer ${newAccessToken}`, {
      ...cookieOptions,
      maxAge: env.ACCESS_TOKEN_EXPIRY,
    })
    .cookie('refresh_token', `Bearer ${newRefreshToken}`, {
      ...cookieOptions,
      maxAge: env.REFRESH_TOKEN_EXPIRY,
    })
    .json({
      success: true,
      messsage: 'Token refreshed successfully',
      newAccessToken, //REMOVE
      newRefreshToken, //REMOVE
    });
});

export const logout = asynError(async (req, res) => {
  const id = req.user?.id;
  if (!id) throw new CustomErrorHandler(401, 'User not logged in');

  await prisma.refreshToken.deleteMany({
    where: { userId: id },
  });

  res
    .status(200)
    .cookie('access_token', null, {
      ...cookieOptions,
      maxAge: 0,
    })
    .cookie('refresh_token', null, {
      ...cookieOptions,
      maxAge: 0,
    })
    .json({
      success: true,
      messsage: 'User logout successfully',
    });
});

export const me = asynError(async (req, res) => {
  if (!req.cookies.access_token)
    throw new CustomErrorHandler(401, 'User must logged in');

  const authHeader = req.cookies.access_token.split(' ')[1];
  let accessToken = authHeaderSchema.safeParse(authHeader);
  if (!accessToken.success)
    throw new CustomErrorHandler(401, 'Invalid authorization header');

  const payload = verifyAccessToken(accessToken.data);
  if (!payload) throw new CustomErrorHandler(403, 'Token revoked');

  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user) throw new CustomErrorHandler(403, 'Unauthorized');

  res.status(202).json({
    success: true,
    message: `Welcome back !`,
    user: payload,
  });
});

export const verifyEmail = asynError(async (req, res) => {
  const { t } = req.query;
  if (!t || typeof t !== 'string') {
    throw new CustomErrorHandler(400, 'Invalid token');
  }

  const user = await prisma.user.findFirst({
    where: {
      emailVerifyToken: t,
      emailTokenExpiry: {
        gte: new Date(),
      },
    },
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired token' });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      emailVerifyToken: null,
      emailTokenExpiry: null,
    },
  });

  res.json({ message: 'Email verified successfully' });
});
