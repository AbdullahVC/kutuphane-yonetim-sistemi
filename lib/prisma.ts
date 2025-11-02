import { PrismaClient } from "../app/generated/prisma";

const g = globalThis as unknown as { prisma?: PrismaClient };

// Only instantiate PrismaClient in Node.js runtime
// This prevents it from being bundled for Edge Runtime
let prismaInstance: PrismaClient | null = null;

function getPrisma() {
  // Runtime check to ensure we're not in Edge Runtime
  if (typeof process === "undefined" || !process.versions?.node) {
    throw new Error(
      "Prisma Client cannot be used in Edge Runtime. This module should only be imported in Node.js runtime (API routes, Server Components)."
    );
  }

  if (!prismaInstance) {
    prismaInstance =
      g.prisma ??
      new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
      });

    if (process.env.NODE_ENV !== "production") g.prisma = prismaInstance;
  }

  return prismaInstance;
}

export const prisma = getPrisma();
