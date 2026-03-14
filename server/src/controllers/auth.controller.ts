/** @format */

import asynError from '../handlers/asyncError';
import { Request } from 'express';
import { loginDTO, RegisterDTO } from '../schemas/auth.schema';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';
import { creatAccessToken, creatRefreshToken } from '../utils/token';
import { env } from '../config/env';
import CustomErrorHandler from '../handlers/CustomError';

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

    res.status(201).cookie('refresh_token', `Bearer ${refreshToken}`, {
      httpOnly: true,
      secure: env.NODE_ENV === 'dev' ? false : true,
      sameSite: env.NODE_ENV === 'dev' ? 'none' : 'strict',
    });
    res.json({
      success: true,
      messsage: 'User register successfully',
      user,
      accessToken,
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

  res.status(200).cookie('refresh_token', `Bearer ${refreshToken}`, {
    httpOnly: true,
    secure: env.NODE_ENV === 'dev' ? false : true,
    sameSite: env.NODE_ENV === 'dev' ? 'none' : 'strict',
  });
  res.json({
    success: true,
    messsage: 'User login successfully',
    user: { fullname, email: userEmail, role, createdAt },
    accessToken,
  });
});
