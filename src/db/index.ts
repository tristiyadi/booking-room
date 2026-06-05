import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// Load environment variables from .env file when running outside Next.js runtime (e.g. seed/migrations)
if (!process.env.DATABASE_URL) {
  try {
    const { loadEnvConfig } = require("@next/env");
    loadEnvConfig(process.cwd());
  } catch {
    // Ignore error if next/env is not loadable in this context
  }
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is missing!");
}

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });
