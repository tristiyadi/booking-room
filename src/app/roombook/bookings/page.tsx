import { getAllBookings } from "@/actions/booking-actions";
import { BookingsClient } from "@/components/bookings/bookings-client";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function BookingsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) redirect("/login");

  const bookings = await getAllBookings();
  const isAdmin =
    (session.user as Record<string, unknown>).role === "admin";

  return (
    <BookingsClient
      bookings={bookings}
      isAdmin={isAdmin}
      userId={session.user.id}
    />
  );
}
