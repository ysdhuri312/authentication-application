/** @format */

import { Router } from 'express';
import {
  login,
  logout,
  refreshToken,
  register,
  me,
  verifyEmail,
  forgotPassword,
  resetPassword,
  googleAuthHandler,
  googleAuthCallbackHandler,
} from '../../controllers/auth.controller';
import validate from '../../middlewares/validate';
import { loginSchema, registerSchema } from '../../schemas/auth.schema';
import { isAuthorized } from '../../middlewares/auth';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refreshToken);
router.get('/logout', isAuthorized, logout);
router.get('/me', me);
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/google', googleAuthHandler);
router.get('/google/callback', googleAuthCallbackHandler);

export default router;
