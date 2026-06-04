"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventInput, EventClickArg } from "@fullcalendar/core";
import {
  Building2,
  DoorOpen,
  Users,
  Clock,
  CalendarDays,
  X,
  Filter,
  ArrowRight,
  LogIn,
  UserPlus,
  LayoutDashboard,
} from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

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

interface Room {
  id: number;
  name: string;
  capacity: number;
  roomType: string;
  isActive: boolean;
  floorId: number;
  floorName: string;
  floorNumber: number;
}

interface PublicCalendarProps {
  bookings: Booking[];
  rooms: Room[];
  isLoggedIn: boolean;
}

export function PublicCalendar({ bookings, rooms, isLoggedIn }: PublicCalendarProps) {
  const [selectedRoomId, setSelectedRoomId] = useState<string>("all");
  const [activeBookingDetail, setActiveBookingDetail] = useState<Booking | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallBtn, setShowInstallBtn] = useState(false);

  useEffect(() => {
    // Check if app is already running as standalone PWA
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone;

    if (isStandalone) {
      setShowInstallBtn(false);
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent browser's automatic install prompt banner
      e.preventDefault();
      // Store event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show the install button
      setShowInstallBtn(true);
    };

    const handleAppInstalled = () => {
      console.log("RoomBook has been successfully installed.");
      setDeferredPrompt(null);
      setShowInstallBtn(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the browser install prompt
    await deferredPrompt.prompt();

    // Wait for the user's choice
    const choiceResult = await deferredPrompt.userChoice;
    if (choiceResult.outcome === "accepted") {
      console.log("User accepted the install prompt");
    } else {
      console.log("User dismissed the install prompt");
    }

    // Clear prompt state
    setDeferredPrompt(null);
    setShowInstallBtn(false);
  };

  // Filter only active bookings and by selected room
  const filteredBookings = useMemo(() => {
    let result = bookings.filter((b) => b.status === "active");
    if (selectedRoomId !== "all") {
      result = result.filter((b) => b.roomId === parseInt(selectedRoomId));
    }
    return result;
  }, [bookings, selectedRoomId]);

  // Generate color palette based on room ID to differentiate rooms visually
  const roomColors = useMemo(() => {
    const colors = [
      { bg: "#3b82f6", border: "#2563eb" }, // Blue
      { bg: "#8b5cf6", border: "#7c3aed" }, // Purple
      { bg: "#ec4899", border: "#db2777" }, // Pink
      { bg: "#f59e0b", border: "#d97706" }, // Amber
      { bg: "#10b981", border: "#059669" }, // Emerald
      { bg: "#06b6d4", border: "#0891b2" }, // Cyan
      { bg: "#f43f5e", border: "#e11d48" }, // Rose
    ];

    const mapping: Record<number, typeof colors[0]> = {};
    rooms.forEach((room, index) => {
      mapping[room.id] = colors[index % colors.length];
    });
    return mapping;
  }, [rooms]);

  // Map to FullCalendar EventInput
  const events: EventInput[] = useMemo(() => {
    return filteredBookings.map((b) => {
      const colors = roomColors[b.roomId] || { bg: "#3b82f6", border: "#2563eb" };
      return {
        id: String(b.id),
        title: `[${b.roomName}] ${b.title}`,
        start: b.startTime,
        end: b.endTime,
        backgroundColor: colors.bg,
        borderColor: colors.border,
        textColor: "#ffffff",
        extendedProps: {
          description: b.description,
          roomName: b.roomName,
          floorName: b.floorName,
          booking: b,
        },
      };
    });
  }, [filteredBookings, roomColors]);

  const handleEventClick = (clickInfo: EventClickArg) => {
    const booking = clickInfo.event.extendedProps.booking as Booking;
    if (booking) {
      setActiveBookingDetail(booking);
    }
  };

  const formatDateTime = (iso: string) => {
    return new Date(iso).toLocaleString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const roomTypeLabels: Record<string, string> = {
    small: "Kecil",
    medium: "Sedang",
    large: "Besar",
    boardroom: "Boardroom",
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-blue-950 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-305">
      {/* Top Navbar */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg tracking-wide bg-gradient-to-r from-blue-600 to-blue-450 dark:from-blue-400 dark:to-blue-200 bg-clip-text text-transparent">
            RoomBook
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {showInstallBtn && (
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-emerald-500/25 cursor-pointer"
            >
              Pasang Aplikasi
            </button>
          )}
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
            >
              <LayoutDashboard className="w-4 h-4" />
              Ke Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Masuk
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/20"
              >
                <UserPlus className="w-4 h-4" />
                Daftar
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 lg:py-12 space-y-12">
        {/* Hero Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            Public Schedule View
          </div>
           <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight bg-gradient-to-b from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            Jadwal Pemakaian Ruang Meeting
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg">
            Pantau jadwal ketersediaan ruangan di bawah ini secara realtime. 
            {!isLoggedIn && " Silakan masuk ke akun Anda atau mendaftar untuk melakukan pemesanan ruangan."}
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            {!isLoggedIn && (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-medium rounded-xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/35 transition-all group"
              >
                Mulai Booking Ruangan Sekarang
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
            {showInstallBtn && (
              <button
                onClick={handleInstallClick}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-xl shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/35 transition-all cursor-pointer"
              >
                Pasang Aplikasi RoomBook (PWA)
              </button>
            )}
          </div>
        </div>

        {/* Filter and Legend Bar */}
        <div className="bg-white/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
              <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-0.5">Filter Ruangan</label>
              <select
                value={selectedRoomId}
                onChange={(e) => setSelectedRoomId(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 w-full md:w-56"
              >
                <option value="all">Semua Ruangan</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name} ({room.floorName})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Color Legend */}
          <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-xs text-slate-550 dark:text-slate-400">
            <span className="font-semibold text-slate-800 dark:text-slate-300">Warna Ruangan:</span>
            {rooms.slice(0, 5).map((room) => {
              const color = roomColors[room.id] || { bg: "#3b82f6" };
              return (
                <div key={room.id} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color.bg }} />
                  <span className="text-slate-700 dark:text-slate-350">{room.name}</span>
                </div>
              );
            })}
            {rooms.length > 5 && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-slate-400 dark:bg-slate-600" />
                <span className="text-slate-700 dark:text-slate-350">+ Lainnya</span>
              </div>
            )}
          </div>
        </div>

        {/* Month Calendar Widget */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 backdrop-blur-md shadow-xl dark:shadow-2xl calendar-wrapper public-calendar-wrapper">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "",
            }}
            locale="id"
            buttonText={{
              today: "Hari Ini",
              month: "Bulan",
            }}
            selectable={false}
            dayMaxEvents={true}
            weekends={true}
            events={events}
            eventClick={handleEventClick}
            height="auto"
            contentHeight={650}
            eventTimeFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }}
            dayHeaderFormat={{
              weekday: "short",
            }}
          />
        </div>
      </main>

      {/* Read-Only Event Detail Dialog Modal */}
      {activeBookingDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setActiveBookingDetail(null)}
          />

          {/* Dialog Container */}
          <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-900 dark:text-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  Detail Booking Ruangan
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Jadwal yang telah terpesan</p>
              </div>
              <button
                onClick={() => setActiveBookingDetail(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-650 dark:hover:text-slate-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Judul Meeting</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 text-base">{activeBookingDetail.title}</p>
              </div>

              {activeBookingDetail.description && (
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Deskripsi</span>
                  <p className="text-sm text-slate-700 dark:text-slate-300">{activeBookingDetail.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Ruangan</span>
                  <div className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300">
                    <DoorOpen className="w-4 h-4 text-blue-500 dark:text-blue-400 shrink-0" />
                    <span className="truncate">{activeBookingDetail.roomName}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Lantai</span>
                  <div className="flex items-center gap-1.5 text-sm text-slate-700 dark:text-slate-300">
                    <Building2 className="w-4 h-4 text-purple-500 dark:text-purple-400 shrink-0" />
                    <span>{activeBookingDetail.floorName}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">Waktu Pemakaian</span>
                <div className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-205">{formatDateTime(activeBookingDetail.startTime)}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5">sampai {formatTime(activeBookingDetail.endTime)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 bg-slate-50/50 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setActiveBookingDetail(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
