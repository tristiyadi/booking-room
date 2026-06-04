import { getAllBookings } from "@/actions/booking-actions";
import { getRooms } from "@/actions/room-actions";
import { PublicCalendar } from "@/components/calendar/public-calendar";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export default async function Home() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const isLoggedIn = !!session?.user;
  const [bookings, rooms] = await Promise.all([getAllBookings(), getRooms()]);

  return (
    <PublicCalendar
      bookings={bookings}
      rooms={rooms}
      isLoggedIn={isLoggedIn}
    />
  );
}
