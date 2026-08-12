import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@partner/shared",
    "@partner/tools",
    "@partner/voice",
    "@partner/wakeword",
    "@partner/ai"
  ],
};

export default nextConfig;
