import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals.push('encoding', 'pino-pretty', 'lokijs', 'node:crypto');
    return config;
  },
  reactStrictMode: true,
};

export default nextConfig;