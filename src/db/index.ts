import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

let sqlite: Database.Database;

if (process.env.NODE_ENV === "production" || process.env.VERCEL) {
  // On serverless platforms like Vercel, the root filesystem is read-only.
  // We copy the database file to the writeable /tmp directory on startup so it can be opened read-write.
  const srcPath = path.join(process.cwd(), "sqlite.db");
  const destPath = "/tmp/sqlite.db";

  try {
    if (!fs.existsSync(destPath)) {
      if (fs.existsSync(srcPath)) {
        fs.copyFileSync(srcPath, destPath);
        console.log("Seeded database successfully copied to /tmp/sqlite.db");
      } else {
        // Create an empty database if the source is missing
        console.warn("Source database not found at process.cwd(). Creating empty DB at /tmp/sqlite.db");
      }
    }
    sqlite = new Database(destPath);
  } catch (err) {
    console.error("Failed to copy/initialize SQLite database in /tmp:", err);
    // Fallback to memory or readonly if /tmp fails
    sqlite = new Database(":memory:");
  }
} else {
  sqlite = new Database("sqlite.db");
}

export const db = drizzle(sqlite, { schema });
