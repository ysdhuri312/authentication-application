/** @format */

import { Request } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

import asynError from '../handlers/asyncError';
import {
  authHeaderSchema,
  loginDTO,
  RegisterDTO,
} from '../schemas/auth.schema';
import { prisma } from '../config/db';
import {
  creatAccessToken,
  creatRefreshToken,
  verifyRefreshToken,
  verifyAccessToken,
  generateResetToken,
  hashToken,
} from '../utils/token';
import CustomErrorHandler from '../handlers/CustomError';
import { cookieOptions } from '../utils/cookieOptions';
import { env } from '../config/env';
import { emailVerify } from '../services/emailVerification';
import { sendResetEmail } from '../services/sendResetEmail';
import { getGoogleClient } from '../services/googleClient';

export const register = asynError(
  async (req: Request<{}, {}, RegisterDTO>, res) => {
    const { fullname, email, password } = req.body;

    const isAlreadyRegister = await prisma.user.findUnique({
      where: { email },
    });

    if (isAlreadyRegister)
      throw new CustomErrorHandler(
        401,
        'User already register, Please logged in or forgot password',
      );

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
    return res
      .status(400)
      .json({ success: false, message: 'Invalid or expired token' });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      isVerified: true,
      emailVerifyToken: null,
      emailTokenExpiry: null,
    },
  });

  res.json({ success: true, message: 'Email verified successfully' });
});

export const forgotPassword = asynError(async (req, res) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.json({
      success: false,
      message: 'If email exists, reset link sent',
    });
  }

  const token = generateResetToken();
  const tokenHash = hashToken(token);

  const expireAt = new Date(Date.now() + 10 * 60 * 1000);

  //delete old token in db
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expireAt,
    },
  });

  await sendResetEmail(email, token);

  res.json({ success: true, message: 'If email exists, reset link sent' });
});

export const resetPassword = asynError(async (req, res) => {
  const token = req.query.t;
  if (!token || typeof token !== 'string') {
    throw new CustomErrorHandler(400, 'Invalid or missing token');
  }

  const { password } = req.body;
  const tokenHash = hashToken(token);

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!record) {
    return res.status(400).json({ message: 'Invalid token' });
  }

  if (record.expireAt < new Date()) {
    return res.status(400).json({ message: 'Token expired' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: record.userId },
    data: { password: hashedPassword },
  });

  // delete token after use
  await prisma.passwordResetToken.delete({
    where: { tokenHash },
  });

  res.json({ success: true, message: 'Password reset successful' });
});

export const googleAuthHandler = asynError(async (req, res) => {
  const client = getGoogleClient();

  const url = client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['openid', 'email', 'profile'],
  });

  return res.redirect(url);
});

export const googleAuthCallbackHandler = asynError(async (req, res) => {
  const code = req.query.code as string | undefined;
  if (!code) throw new CustomErrorHandler(400, 'Missing code in callback');

  const client = getGoogleClient();

  const { tokens } = await client.getToken(code);
  if (!tokens.id_token)
    throw new CustomErrorHandler(400, 'Google id_token is not present');

  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  const email = payload?.email;
  if (!email || !payload.email_verified)
    throw new CustomErrorHandler(400, 'Google account not verified');

  const normalizeEmail = email.toLowerCase().trim();

  const isAlreadyRegister = await prisma.user.findUnique({
    where: { email: normalizeEmail },
  });

  if (isAlreadyRegister)
    throw new CustomErrorHandler(
      401,
      'User already register, Please logged in or forgot password',
    );

  const password = crypto.randomBytes(16).toString('hex');
  const hashedPassword = crypto
    .createHash('sha256')
    .update(password)
    .digest('hex');

  const user = await prisma.user.create({
    data: {
      fullname: payload.name!,
      email,
      password: hashedPassword,
      isVerified: true,
      provider: 'google',
      providerID: payload.sub,
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
  const accessToken = creatAccessToken({ id, userEmail, role });
  const refreshToken = creatRefreshToken({ id, userEmail, role });

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
    .redirect(`${env.FRONTEND_URL}/about`);
});
