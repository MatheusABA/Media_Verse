import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "image.tmdb.org",
      "localhost",
      "192.168.1.8"
    ],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3333',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.1.8',
        port: '3333',
        pathname: '/uploads/**',
      },
    ],
  },
  devIndicators: false,
};

export default nextConfig;