/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: 'drive.google.com'
          }, {
            protocol: 'https',
            hostname: '**.googleusercontent.com'
          }, {
            protocol: 'https',
            hostname: '**',
            port: '',
            pathname: '**',
        },
        ],
        domains: [
          'drive.google.com',
          '**.googleusercontent.com',
          '**.com'
        ]
      }
}

module.exports = nextConfig
