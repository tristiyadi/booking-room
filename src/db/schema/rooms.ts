import { pgTable, serial, text, integer, boolean } from "drizzle-orm/pg-core";
import { floors } from "./floors";

export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  floorId: integer("floor_id")
    .notNull()
    .references(() => floors.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  capacity: integer("capacity").notNull().default(10),
  roomType: text("room_type").notNull().default("medium"), // small, medium, large, boardroom
  isActive: boolean("is_active").notNull().default(true),
  facilities: text("facilities"),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});
