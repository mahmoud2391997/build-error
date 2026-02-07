/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  // Disable static generation for API routes
  trailingSlash: false,
};

module.exports = nextConfig;
