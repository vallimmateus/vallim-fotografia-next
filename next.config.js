/** @type {import('next').NextConfig} */
const nextConfig = {
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
  async rewrites() {
    return [
      {
        source: '/images/:path*',
        destination:
          'https://pub-b4d289cda78e4af7bee698e19458c393.r2.dev/:path*',
      },
    ]
  },
}

module.exports = nextConfig
