"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBooking, cancelBooking } from "@/actions/booking-actions";
import { X, CalendarDays, Clock, Loader2, Trash2 } from "lucide-react";

interface BookingDialogProps {
  open: boolean;
  onClose: () => void;
  roomId: number;
  roomName: string;
  userId: string;
  selectedRange: { start: string; end: string } | null;
  selectedBooking: {
    id: number;
    title: string;
    description: string | null;
    startTime: string;
    endTime: string;
    status: string;
    userId: string;
  } | null;
  onBookingCancelled?: (bookingId: number) => void;
}

export function BookingDialog({
  open,
  onClose,
  roomId,
  roomName,
  userId,
  selectedRange,
  selectedBooking,
  onBookingCancelled,
}: BookingDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const isViewMode = !!selectedBooking;
  const isOwner = selectedBooking?.userId === userId;

  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRange) return;

    setError("");
    setLoading(true);

    try {
      await createBooking({
        roomId,
        userId,
        title,
        description: description || undefined,
        startTime: selectedRange.start,
        endTime: selectedRange.end,
      });
      setTitle("");
      setDescription("");
      onClose();
      router.refresh();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Gagal membuat booking.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedBooking) return;
    setLoading(true);
    try {
      await cancelBooking(selectedBooking.id);
      // Optimistically update calendar UI immediately
      onBookingCancelled?.(selectedBooking.id);
      onClose();
      router.refresh();
    } catch {
      setError("Gagal membatalkan booking.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold">
              {isViewMode ? "Detail Booking" : "Buat Booking Baru"}
            </h3>
            <p className="text-sm text-muted-foreground">{roomName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-accent transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {isViewMode && selectedBooking ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Judul</p>
                <p className="font-medium">{selectedBooking.title}</p>
              </div>
              {selectedBooking.description && (
                <div>
                  <p className="text-sm text-muted-foreground">Deskripsi</p>
                  <p className="text-sm">{selectedBooking.description}</p>
                </div>
              )}
              <div className="flex items-start gap-3">
                <CalendarDays className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm">
                    {formatDateTime(selectedBooking.startTime)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    sampai {formatTime(selectedBooking.endTime)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <span
                  className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedBooking.status === "active"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-gray-500/10 text-gray-400"
                  }`}
                >
                  {selectedBooking.status === "active"
                    ? "Aktif"
                    : "Dibatalkan"}
                </span>
              </div>

              {isOwner && selectedBooking.status === "active" && (
                <div className="pt-2 border-t border-border">
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    Batalkan Booking
                  </button>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleCreate} className="space-y-4">
              {selectedRange && (
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                  <Clock className="w-4 h-4 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-blue-300 font-medium">
                      Waktu yang dipilih
                    </p>
                    <p className="text-xs text-blue-400/80">
                      {formatDateTime(selectedRange.start)} -{" "}
                      {formatTime(selectedRange.end)}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="booking-title"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Judul Meeting *
                </label>
                <input
                  id="booking-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Rapat Tim Marketing"
                  required
                  className="w-full px-4 py-2.5 bg-accent/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="booking-desc"
                  className="text-sm font-medium text-muted-foreground"
                >
                  Deskripsi
                </label>
                <textarea
                  id="booking-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Deskripsi meeting (opsional)"
                  rows={3}
                  className="w-full px-4 py-2.5 bg-accent/50 border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all text-sm resize-none"
                />
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-border rounded-xl text-sm font-medium text-muted-foreground hover:bg-accent transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Simpan Booking"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
