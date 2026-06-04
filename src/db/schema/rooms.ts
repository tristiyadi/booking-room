import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { floors } from "./floors";

export const rooms = sqliteTable("rooms", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  floorId: integer("floor_id")
    .notNull()
    .references(() => floors.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  capacity: integer("capacity").notNull().default(10),
  roomType: text("room_type", {
    enum: ["small", "medium", "large", "boardroom"],
  })
    .notNull()
    .default("medium"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  facilities: text("facilities"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});
