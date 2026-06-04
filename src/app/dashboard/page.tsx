import { getFloors } from "@/actions/floor-actions";
import { getRooms } from "@/actions/room-actions";
import { getAllBookings } from "@/actions/booking-actions";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
  const [floorsData, roomsData, bookingsData] = await Promise.all([
    getFloors(),
    getRooms(),
    getAllBookings(),
  ]);

  const today = new Date().toISOString().split("T")[0];
  const todayBookings = bookingsData.filter(
    (b) => b.status === "active" && b.startTime.startsWith(today)
  );

  const activeRooms = roomsData.filter((r) => r.isActive);
  const now = new Date().toISOString();
  const currentlyBooked = bookingsData.filter(
    (b) => b.status === "active" && b.startTime <= now && b.endTime >= now
  );
  const availableNow = activeRooms.length - currentlyBooked.length;

  return (
    <DashboardClient
      floors={floorsData}
      rooms={roomsData}
      todayBookingsCount={todayBookings.length}
      availableNow={availableNow}
      totalRooms={activeRooms.length}
    />
  );
}
