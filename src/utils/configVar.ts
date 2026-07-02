import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

dotenv.config();


const configSchema = z.object({
  port: z.string().default('3000').transform(Number),
  
  mongoUrl: z.string({ error: "MONGO_URI is required" }),
  redisUrl: z.string({ error: "REDIS_URL is required" }),
  bcryptSaltRounds: z.string().default('10').transform(Number),
  jwtSecret: z.string({ error: "JWT_SECRET is required" }),
  jwtExpiresIn: z.string().min(1) as z.ZodType<jwt.SignOptions['expiresIn']>,
  jwtRefreshExpiresIn: z.string().min(1).default('7d') as z.ZodType<jwt.SignOptions['expiresIn']>,
  jwtRefreshSecret: z.string({ error: "JWT_REFRESH_SECRET is required" }),
});

type AppConfig = z.infer<typeof configSchema>;

const parsed = configSchema.safeParse({
  port: process.env.PORT,
  mongoUrl: process.env.MONGO_URI,
  redisUrl: process.env.REDIS_URL,
  bcryptSaltRounds: process.env.BCRYPT_SALT_ROUNDS,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
});

if (!parsed.success) {
  console.error('❌ An error occurred while parsing .env file:');
  process.exit(1); 
}

export const config: AppConfig = parsed.data;