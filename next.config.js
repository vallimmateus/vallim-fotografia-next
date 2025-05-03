/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '1gb',
    },
  },
  images: {
    unoptimized: true,
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
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
    ],
    domains: [
      'drive.google.com',
      '**.googleusercontent.com',
      '**.r2.cloudflarestorage.com',
      '**.r2.dev',
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  redirects() {
    // Temporarily redirect to the new event page
    return [
      {
        source: '/',
        destination: '/event/2025/dgg-submundo',
        permanent: true,
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/images/:path*',
        destination: 'https://d3edmjeascdk88.cloudfront.net/:path*',
      },
    ]
  },
}

module.exports = nextConfig
