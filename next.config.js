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
    ],
    domains: ['drive.google.com', '**.googleusercontent.com'],
  },
  experimental: {
    serverActions: true,
  },
}

module.exports = nextConfig
