import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow build to complete even with missing optional environment variables
  // This is fine for a localhost prototype — run with `npm run dev` not `npm run build`
  typescript: {
    ignoreBuildErrors: false,
  }
};

export default nextConfig;
