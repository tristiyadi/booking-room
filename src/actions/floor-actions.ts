"use server";

import { db } from "@/db";
import { floors } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getFloors() {
  return await db.select().from(floors).orderBy(floors.floorNumber);
}

export async function getFloorById(id: number) {
  const result = await db.select().from(floors).where(eq(floors.id, id));
  return result[0] || null;
}

export async function createFloor(data: {
  name: string;
  floorNumber: number;
}) {
  const result = await db.insert(floors).values(data).returning();
  revalidatePath("/dashboard");
  revalidatePath("/roombook/floors");
  return result[0];
}

export async function updateFloor(
  id: number,
  data: { name?: string; floorNumber?: number }
) {
  const result = await db
    .update(floors)
    .set(data)
    .where(eq(floors.id, id))
    .returning();
  revalidatePath("/dashboard");
  revalidatePath("/roombook/floors");
  return result[0];
}

export async function deleteFloor(id: number) {
  await db.delete(floors).where(eq(floors.id, id));
  revalidatePath("/dashboard");
  revalidatePath("/roombook/floors");
}
