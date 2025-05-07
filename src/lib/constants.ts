export const basePath =
  (process.env.NEXT_PUBLIC_VERCEL_URL &&
    `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`) ||
  (process.env.NEXT_PUBLIC_BASE_PATH &&
    (!process.env.NEXT_PUBLIC_BASE_PATH.includes('https://')
      ? `https://${process.env.NEXT_PUBLIC_BASE_PATH}`
      : process.env.NEXT_PUBLIC_BASE_PATH)) ||
  'http://localhost:3000'

export const s3Paths = {
  folders: {
    event: 'event',
    organization: 'organization',
  },
}
