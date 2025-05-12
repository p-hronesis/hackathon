import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // Optional: Disable image optimization
  images: {
    unoptimized: true,
  },
  // Optional: Export only APIs
  output: "standalone",
};

export default nextConfig;
