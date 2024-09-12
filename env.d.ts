declare namespace NodeJS {
  interface ProcessEnv {
    DATABASE_URL: string
    GOOGLE_CLIENT_ID: string
    GOOGLE_CLIENT_SECRET: string
    SECRET: string
    CLOUDFLARE_ENDPOINT: string
    CLOUDFLARE_ACCESS_KEY_ID: string
    CLOUDFLARE_SECRET_ACCESS_KEY: string
    CLOUDFLARE_R2_BUCKET: string
  }
}
