import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "21mb"
    }
  },
  images: {
    remotePatterns: [
      {
        hostname: "**",
        protocol: "https"
      }
    ]
  }
};

export default nextConfig;
