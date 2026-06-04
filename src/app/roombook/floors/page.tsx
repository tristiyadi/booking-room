import { getFloors } from "@/actions/floor-actions";
import { getRooms } from "@/actions/room-actions";
import { FloorsClient } from "@/components/floors/floors-client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function FloorsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) redirect("/login");

  const isAdmin =
    (session.user as Record<string, unknown>).role === "admin";

  const [floors, rooms] = await Promise.all([getFloors(), getRooms()]);

  return <FloorsClient floors={floors} rooms={rooms} isAdmin={isAdmin} />;
}
