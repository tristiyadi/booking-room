"use server";

import { db } from "@/db";
import { bookings, rooms, floors } from "@/db/schema";
import { eq, and, or, lt, gt, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getBookingsByRoom(roomId: number) {
  return await db
    .select()
    .from(bookings)
    .where(and(eq(bookings.roomId, roomId), eq(bookings.status, "active")))
    .orderBy(bookings.startTime);
}

export async function getAllBookings() {
  return await db
    .select({
      id: bookings.id,
      title: bookings.title,
      description: bookings.description,
      startTime: bookings.startTime,
      endTime: bookings.endTime,
      status: bookings.status,
      userId: bookings.userId,
      roomId: bookings.roomId,
      roomName: rooms.name,
      floorName: floors.name,
      floorNumber: floors.floorNumber,
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .innerJoin(rooms, eq(bookings.roomId, rooms.id))
    .innerJoin(floors, eq(rooms.floorId, floors.id))
    .orderBy(bookings.startTime);
}

export async function createBooking(data: {
  roomId: number;
  userId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
}) {
  // Check for overlapping bookings
  const overlapping = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.roomId, data.roomId),
        eq(bookings.status, "active"),
        lt(bookings.startTime, data.endTime),
        gt(bookings.endTime, data.startTime)
      )
    );

  if (overlapping.length > 0) {
    throw new Error(
      "Jadwal bentrok! Sudah ada booking aktif pada waktu tersebut."
    );
  }

  const result = await db.insert(bookings).values(data).returning();
  revalidatePath("/dashboard");
  revalidatePath(`/roombook/rooms/${data.roomId}`);
  revalidatePath("/roombook/bookings");
  return result[0];
}

export async function updateBooking(
  id: number,
  data: {
    title?: string;
    description?: string;
    startTime?: string;
    endTime?: string;
  }
) {
  // If time is changing, check for overlaps
  if (data.startTime && data.endTime) {
    const existing = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id));

    if (existing[0]) {
      const overlapping = await db
        .select()
        .from(bookings)
        .where(
          and(
            eq(bookings.roomId, existing[0].roomId),
            eq(bookings.status, "active"),
            ne(bookings.id, id),
            lt(bookings.startTime, data.endTime),
            gt(bookings.endTime, data.startTime)
          )
        );

      if (overlapping.length > 0) {
        throw new Error(
          "Jadwal bentrok! Sudah ada booking aktif pada waktu tersebut."
        );
      }
    }
  }

  const result = await db
    .update(bookings)
    .set(data)
    .where(eq(bookings.id, id))
    .returning();
  revalidatePath("/dashboard");
  revalidatePath("/roombook/bookings");
  return result[0];
}

export async function cancelBooking(id: number) {
  const result = await db
    .update(bookings)
    .set({ status: "cancelled" })
    .where(eq(bookings.id, id))
    .returning();
  revalidatePath("/dashboard");
  revalidatePath("/roombook/bookings");
  return result[0];
}
