"use server";

import { db } from "@/db";
import { rooms, floors } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getRooms(floorId?: number) {
  if (floorId) {
    return await db
      .select({
        id: rooms.id,
        name: rooms.name,
        capacity: rooms.capacity,
        roomType: rooms.roomType,
        isActive: rooms.isActive,
        facilities: rooms.facilities,
        floorId: rooms.floorId,
        floorName: floors.name,
        floorNumber: floors.floorNumber,
        createdAt: rooms.createdAt,
      })
      .from(rooms)
      .innerJoin(floors, eq(rooms.floorId, floors.id))
      .where(eq(rooms.floorId, floorId))
      .orderBy(rooms.name);
  }

  return await db
    .select({
      id: rooms.id,
      name: rooms.name,
      capacity: rooms.capacity,
      roomType: rooms.roomType,
      isActive: rooms.isActive,
      facilities: rooms.facilities,
      floorId: rooms.floorId,
      floorName: floors.name,
      floorNumber: floors.floorNumber,
      createdAt: rooms.createdAt,
    })
    .from(rooms)
    .innerJoin(floors, eq(rooms.floorId, floors.id))
    .orderBy(floors.floorNumber, rooms.name);
}

export async function getRoomById(id: number) {
  const result = await db
    .select({
      id: rooms.id,
      name: rooms.name,
      capacity: rooms.capacity,
      roomType: rooms.roomType,
      isActive: rooms.isActive,
      facilities: rooms.facilities,
      floorId: rooms.floorId,
      floorName: floors.name,
      floorNumber: floors.floorNumber,
    })
    .from(rooms)
    .innerJoin(floors, eq(rooms.floorId, floors.id))
    .where(eq(rooms.id, id));
  return result[0] || null;
}

export async function createRoom(data: {
  name: string;
  floorId: number;
  capacity: number;
  roomType: "small" | "medium" | "large" | "boardroom";
  facilities?: string | null;
}) {
  const result = await db.insert(rooms).values(data).returning();
  revalidatePath("/dashboard");
  revalidatePath("/roombook/rooms");
  return result[0];
}

export async function updateRoom(
  id: number,
  data: {
    name?: string;
    floorId?: number;
    capacity?: number;
    roomType?: "small" | "medium" | "large" | "boardroom";
    facilities?: string | null;
    isActive?: boolean;
  }
) {
  const result = await db
    .update(rooms)
    .set(data)
    .where(eq(rooms.id, id))
    .returning();
  revalidatePath("/dashboard");
  revalidatePath("/roombook/rooms");
  return result[0];
}

export async function deleteRoom(id: number) {
  // Soft delete
  await db.update(rooms).set({ isActive: false }).where(eq(rooms.id, id));
  revalidatePath("/dashboard");
  revalidatePath("/roombook/rooms");
}
