/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'drive.google.com'
          },
          {
            protocol: 'https',
            hostname: '**.googleusercontent.com'
          }
        ],
        domains: [
          'drive.google.com',
          '**.googleusercontent.com'
        ]
      }
}

module.exports = nextConfig
