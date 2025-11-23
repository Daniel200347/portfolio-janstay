import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true, // Необходимо для статического экспорта
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.figma.com",
      },
    ],
  },
  // basePath нужен, так как репозиторий называется portfolio-janstay, а не username.github.io
  basePath: process.env.NODE_ENV === 'production' ? '/portfolio-janstay' : '',
  trailingSlash: true,
};

export default nextConfig;
