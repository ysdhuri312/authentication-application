/** @format */

import z from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['dev']),
  PORT: z.string().transform((val) => Number(val)),
  DATABASE_URL: z.url(),
  JWT_ACCESS_TOKEN: z.string().min(10),
  JWT_REFRESH_TOKEN: z.string().min(10),
  ACCESS_TOKEN_EXPIRY: z.string().transform((val) => Number(val)),
  REFRESH_TOKEN_EXPIRY: z.string().transform((val) => Number(val)),
  EMAIL: z.email(),
  EMAIL_APP_PASSWORD: z.string(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
