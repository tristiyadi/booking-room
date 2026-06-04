import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const floors = sqliteTable("floors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  floorNumber: integer("floor_number").notNull().unique(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});
