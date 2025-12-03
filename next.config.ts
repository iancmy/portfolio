import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.1/**"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "storage.ko-fi.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "yt3.ggpht.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "i.ytimg.com",
        pathname: "**",
      },
    ],
  }
};

export default nextConfig;
