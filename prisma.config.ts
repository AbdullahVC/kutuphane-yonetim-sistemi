import { defineConfig, env } from "prisma/config";

// During build, DATABASE_URL might not be available, but prisma generate doesn't need it
// Provide a dummy URL for config validation, it won't be used during generate
const databaseUrl = process.env.DATABASE_URL || "postgresql://user:password@localhost:5432/db";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: databaseUrl,
  },
});
