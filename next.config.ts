import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.veke.fi",
      },
    ],
  },
  outputFileTracingIncludes: {
    "/*": ["./tuotelista-muokattu.csv", "./tikkurila_tunne_vari_2020.csv"],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
