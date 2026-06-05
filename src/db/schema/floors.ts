import { pgTable, serial, text, integer } from "drizzle-orm/pg-core";

export const floors = pgTable("floors", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  floorNumber: integer("floor_number").notNull().unique(),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});
