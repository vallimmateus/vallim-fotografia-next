import { z } from 'zod'

const envSchema = z.object({
  CLOUDFLARE_ENDPOINT: z.string(),
  CLOUDFLARE_ACCESS_KEY_ID: z.string(),
  CLOUDFLARE_SECRET_ACCESS_KEY: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
})

export const env = envSchema.partial().parse(process.env)
