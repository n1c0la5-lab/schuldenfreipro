import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@schuldenpro/ui", "@schuldenpro/db", "@schuldenpro/engine"],
};

export default nextConfig;
