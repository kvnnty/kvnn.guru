import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Parent lockfile at C:\Users\user confuses Next; pin tracing to this project.
  outputFileTracingRoot: path.join(__dirname),
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.scdn.co",
      },
      {
        protocol: "https",
        hostname: "rstr.in",
      },
    ],
  },
};

export default nextConfig;
