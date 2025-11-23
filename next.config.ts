import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === 'production';
const basePath = isProduction ? '/portfolio-janstay' : '';

const nextConfig: NextConfig = {
  output: 'export',
  basePath: basePath,
  assetPrefix: basePath,
  images: {
    unoptimized: true, // Необходимо для статического экспорта
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.figma.com",
      },
    ],
  },
  trailingSlash: true,
};

export default nextConfig;
