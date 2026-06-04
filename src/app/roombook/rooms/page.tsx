import { getRooms } from "@/actions/room-actions";
import { getFloors } from "@/actions/floor-actions";
import { RoomsClient } from "@/components/rooms/rooms-client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function RoomsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) redirect("/login");

  const [rooms, floors] = await Promise.all([getRooms(), getFloors()]);

  const isAdmin =
    (session.user as Record<string, unknown>).role === "admin";

  return <RoomsClient rooms={rooms} floors={floors} isAdmin={isAdmin} />;
}
