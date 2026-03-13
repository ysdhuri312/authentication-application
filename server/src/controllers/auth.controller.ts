/** @format */

import asynError from '../handlers/asyncError';
import { Request } from 'express';
import { RegisterDTO } from '../schemas/auth.schema';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';
import { creatAccessToken, creatRefreshToken } from '../utils/token';
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

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
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
