import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "better-sqlite3",
  ],
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        "**/sqlite.db",
        "**/sqlite.db-journal",
        "**/sqlite.db-shm",
        "**/sqlite.db-wal",
      ],
    };
    return config;
  },
};

export default nextConfig;
