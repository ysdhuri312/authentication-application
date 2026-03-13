/** @format */

import asynError from '../handlers/asyncError';
import { Request } from 'express';
import { RegisterDTO } from '../schemas/auth.schema';
import bcrypt from 'bcryptjs';
import { prisma } from '../config/db';

export const register = asynError(
  async (req: Request<{}, {}, RegisterDTO>, res) => {
    const { fullname, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        fullname,
        email,
        password: hashedPassword,
      },
    });

    res.json({
      status: true,
      messsage: 'User register successfully',
    });
  },
);
