import { getRoomById } from "@/actions/room-actions";
import { getBookingsByRoom } from "@/actions/booking-actions";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { RoomCalendar } from "@/components/calendar/room-calendar";
import { RoomPanoramaButton } from "@/components/rooms/room-panorama-button";
import Link from "next/link";
import { ArrowLeft, Users, Building2, DoorOpen } from "lucide-react";

export default async function RoomCalendarPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const { roomId } = await params;
  const id = parseInt(roomId);

  if (isNaN(id)) notFound();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const room = await getRoomById(id);
  if (!room) notFound();

  const bookings = await getBookingsByRoom(id);

  const roomTypeLabels: Record<string, string> = {
    small: "Kecil",
    medium: "Sedang",
    large: "Besar",
    boardroom: "Boardroom",
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/roombook/rooms"
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <DoorOpen className="w-6 h-6 text-blue-500" />
              {room.name}
            </h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                {room.floorName}
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {room.capacity} orang
              </span>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-xs font-medium">
                {roomTypeLabels[room.roomType] || room.roomType}
              </span>
            </div>
            {room.facilities && (
              <div className="mt-3 space-y-1.5 max-w-xl">
                <span className="text-xs font-semibold text-muted-foreground block">Fasilitas:</span>
                <div className="flex flex-wrap gap-1.5">
                  {room.facilities.split(",").map((f, idx) => {
                    const facility = f.trim();
                    if (!facility) return null;
                    return (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded bg-accent/50 text-accent-foreground border border-border/50 text-xs font-medium"
                      >
                        {facility}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        {room.panoramaUrl && (
          <div className="pt-2">
            <RoomPanoramaButton panoramaUrl={room.panoramaUrl} roomName={room.name} />
          </div>
        )}
      </div>

      {/* Calendar */}
      <RoomCalendar
        roomId={id}
        roomName={room.name}
        bookings={bookings}
        userId={session.user.id}
      />
    </div>
  );
}
