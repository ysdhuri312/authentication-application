/** @format */

import z from 'zod';

export const registerSchema = z.object({
  fullname: z.string().trim().min(3, 'Name must be at least three character'),
  email: z.email('Invalid email'),
  password: z
    .string()
    .min(8, 'Password must be at least eight character')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Password must contain uppercase, lowercase, number, and special character',
    ),
});

export type RegisterDTO = z.infer<typeof registerSchema>;
