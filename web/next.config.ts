import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  // Enable standalone output for optimized Docker builds
  output: 'standalone',
  // Required for react-pdf to work properly with Turbopack
  turbopack: {},
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      // Remote API hostname for images (derived from NEXT_PUBLIC_API_URL env var)
      ...(process.env.NEXT_PUBLIC_API_URL
        ? [{
            protocol: new URL(process.env.NEXT_PUBLIC_API_URL).protocol.replace(':', '') as 'http' | 'https',
            hostname: new URL(process.env.NEXT_PUBLIC_API_URL).hostname,
            ...(new URL(process.env.NEXT_PUBLIC_API_URL).port ? { port: new URL(process.env.NEXT_PUBLIC_API_URL).port } : {}),
          }]
        : []),
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/concerts',
        has: [{ type: 'query', key: 'concert', value: '(?<id>.+)' }],
        destination: '/concerts/:id',
        permanent: true,
      },
      {
        source: '/events',
        has: [{ type: 'query', key: 'event', value: '(?<id>.+)' }],
        destination: '/events/:id',
        permanent: true,
      },
      {
        source: '/songs',
        has: [{ type: 'query', key: 'song', value: '(?<id>.+)' }],
        destination: '/songs/:id',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
