"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cancelBooking } from "@/actions/booking-actions";
import {
  CalendarDays,
  Trash2,
  Loader2,
  Filter,
} from "lucide-react";

interface Booking {
  id: number;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  status: string;
  userId: string;
  roomId: number;
  roomName: string;
  floorName: string;
  floorNumber: number;
}

interface BookingsClientProps {
  bookings: Booking[];
  isAdmin: boolean;
  userId: string;
}

export function BookingsClient({
  bookings,
  isAdmin,
  userId,
}: BookingsClientProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const router = useRouter();

  const filtered =
    statusFilter === "all"
      ? bookings
      : bookings.filter((b) => b.status === statusFilter);

  const handleCancel = async (id: number) => {
    if (!confirm("Yakin ingin membatalkan booking ini?")) return;
    setCancellingId(id);
    try {
      await cancelBooking(id);
      router.refresh();
    } catch {
      alert("Gagal membatalkan booking.");
    } finally {
      setCancellingId(null);
    }
  };

  const formatDateTime = (iso: string) => {
    return new Date(iso).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Semua Booking</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {filtered.length} booking ditemukan
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="all">Semua Status</option>
            <option value="active">Aktif</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <CalendarDays className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Belum ada booking.</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Judul
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">
                    Ruangan
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">
                    Lantai
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Waktu Mulai
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">
                    Waktu Selesai
                  </th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((booking) => {
                  const canCancel =
                    booking.status === "active" &&
                    (isAdmin || booking.userId === userId);
                  return (
                    <tr
                      key={booking.id}
                      className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors"
                    >
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-sm">{booking.title}</p>
                          {booking.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                              {booking.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm hidden sm:table-cell">
                        {booking.roomName}
                      </td>
                      <td className="p-4 text-sm text-muted-foreground hidden md:table-cell">
                        {booking.floorName}
                      </td>
                      <td className="p-4 text-sm">
                        {formatDateTime(booking.startTime)}
                      </td>
                      <td className="p-4 text-sm hidden lg:table-cell">
                        {formatDateTime(booking.endTime)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            booking.status === "active"
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-gray-500/10 text-gray-400"
                          }`}
                        >
                          {booking.status === "active"
                            ? "Aktif"
                            : "Dibatalkan"}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {canCancel && (
                          <button
                            onClick={() => handleCancel(booking.id)}
                            disabled={cancellingId === booking.id}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors disabled:opacity-50"
                            title="Batalkan"
                          >
                            {cancellingId === booking.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
