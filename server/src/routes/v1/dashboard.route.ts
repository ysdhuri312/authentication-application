/** @format */

import { Router } from 'express';
import { dashboard } from '../../controllers/dashboard.controller';
import { isAuthorized } from '../../middlewares/auth';

const router = Router();

router.get('/home', isAuthorized, dashboard);

export default router;
