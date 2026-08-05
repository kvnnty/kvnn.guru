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
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
      },
      {
        protocol: "https",
        hostname: "images.chesscomfiles.com",
      },
      {
        protocol: "https",
        hostname: "image.api.playstation.com",
      },
    ],
  },
};

export default nextConfig;
