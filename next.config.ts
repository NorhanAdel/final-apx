import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '72.62.28.146',
        port: '',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;