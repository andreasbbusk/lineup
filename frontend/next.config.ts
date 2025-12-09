import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      // Allow images from any HTTPS source (for user avatars, external images, etc.)
      {
        protocol: "https",
        hostname: "**",
      },
      // Allow images from HTTP sources (for development/local)
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
