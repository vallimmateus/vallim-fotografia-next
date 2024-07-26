/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
      },
    ],
    domains: [
      'drive.google.com',
      '**.googleusercontent.com',
      '**.r2.cloudflarestorage.com',
    ],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
