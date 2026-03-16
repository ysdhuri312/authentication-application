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
  verifyToken,
} from '../utils/token';
import CustomErrorHandler from '../handlers/CustomError';
import { cookieOptions } from '../utils/cookieOptions';

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
        expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    res
      .status(201)
      .cookie('access_token', `Bearer ${accessToken}`, cookieOptions)
      .cookie('refresh_token', `Bearer ${refreshToken}`, cookieOptions)
      .json({
        success: true,
        messsage: 'User register successfully',
        user,
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
      expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  res
    .status(200)
    .cookie('access_token', `Bearer ${accessToken}`, cookieOptions)
    .cookie('refresh_token', `Bearer ${refreshToken}`, cookieOptions)
    .json({
      success: true,
      messsage: 'User login successfully',
      user: { fullname, email: userEmail, role, createdAt },
      accessToken,
    });
});

export const refreshToken = asynError(async (req, res) => {
  if (!req.headers['refresh_token'])
    throw new CustomErrorHandler(401, 'Unauthorized');

  const result = authHeaderSchema.safeParse(req.headers['refresh_token']);
  if (!result.success)
    throw new CustomErrorHandler(401, 'Invalid authorization header');

  let refreshToken = result.data!;
  const payload = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!payload) throw new CustomErrorHandler(401, 'Invalid token');

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) throw new CustomErrorHandler(401, 'Unauthorized');

  const { id, email, role } = user;
  const newAccessToken = creatAccessToken({ id, userEmail: email, role });
  const newRefreshToken = creatRefreshToken({ id, userEmail: email, role });

  await prisma.refreshToken.delete({ where: { id: payload.id } });
  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: id,
      expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  res
    .status(200)
    .cookie('access_token', `Bearer ${newAccessToken}`, cookieOptions)
    .cookie('refresh_token', `Bearer ${newRefreshToken}`, cookieOptions)
    .json({
      success: true,
      messsage: 'Token refreshed successfully',
    });
});
