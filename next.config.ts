
import type { NextConfig } from "next";

const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // serverActions: true, // enabled by default in 15
  },
};

export default withPWA(nextConfig);
