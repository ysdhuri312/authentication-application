/** @format */

import asynError from '../handlers/asyncError';
import CustomErrorHandler from '../handlers/CustomError';

export const dashboard = asynError(async (req, res) => {
  const user = req.user;

  if (!user) throw new CustomErrorHandler(401, 'Unauthorize');

  if (user.role != 'ADMIN')
    throw new CustomErrorHandler(403, 'User not admin user');
  res.status(202).json({ success: true, message: 'Admin user', user });
});
