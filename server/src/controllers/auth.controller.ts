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
} from '../utils/token';
import CustomErrorHandler from '../handlers/CustomError';
import { cookieOptions } from '../utils/cookieOptions';
import { env } from '../config/env';

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
  const userId = req.user?.id;
  console.log(userId);
  if (!userId) throw new CustomErrorHandler(401, 'User not logged in');

  await prisma.refreshToken.delete({ where: { id: userId } });

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
