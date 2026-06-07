import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.coincap.io",
        pathname: "/assets/icons/**",
      },
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
        pathname: "/gh/spothq/cryptocurrency-icons@master/128/color/**",
      },
    ],
  },
};

export default nextConfig;
