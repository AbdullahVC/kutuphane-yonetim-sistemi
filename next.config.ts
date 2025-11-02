import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure Prisma packages are treated as external and not bundled for Edge Runtime
  // This prevents Next.js from trying to bundle Prisma WASM files
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default nextConfig;
