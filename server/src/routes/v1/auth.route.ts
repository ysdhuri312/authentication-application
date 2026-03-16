/** @format */

import { Router } from 'express';
import {
  login,
  refreshToken,
  register,
} from '../../controllers/auth.controller';
import validate from '../../middlewares/validate';
import { loginSchema, registerSchema } from '../../schemas/auth.schema';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refreshToken);

export default router;
