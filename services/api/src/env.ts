import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development','test','production']).default('development'),
  PORT: z.string().default('3001'),
  AWS_REGION: z.string().min(1).default('us-east-1'),
  ACCOUNT_REGION_DEFAULT: z.string().default('us'),
  CLERK_SECRET_KEY: z.string().optional(),
  S3_BUCKET_US: z.string().min(1).default('arqivo-us'),
  S3_BUCKET_EU: z.string().min(1).default('arqivo-eu'),
  AWS_S3_ENDPOINT: z.string().optional(),
  AWS_S3_FORCE_PATH_STYLE: z.string().optional(),
  STRICT_AUTH: z.string().optional(),
  DEV_AUTH_BYPASS: z.string().optional(),
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  AWS_REGION: process.env.AWS_REGION,
  ACCOUNT_REGION_DEFAULT: process.env.ACCOUNT_REGION_DEFAULT,
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  S3_BUCKET_US: process.env.S3_BUCKET_US,
  S3_BUCKET_EU: process.env.S3_BUCKET_EU,
  AWS_S3_ENDPOINT: process.env.AWS_S3_ENDPOINT,
  AWS_S3_FORCE_PATH_STYLE: process.env.AWS_S3_FORCE_PATH_STYLE,
  STRICT_AUTH: process.env.STRICT_AUTH,
  DEV_AUTH_BYPASS: process.env.DEV_AUTH_BYPASS,
});
