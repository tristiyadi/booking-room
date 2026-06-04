"use client";

import Link from "next/link";
import {
  Building2,
  DoorOpen,
  CalendarDays,
  CheckCircle2,
  Users,
  ArrowRight,
} from "lucide-react";

interface Floor {
  id: number;
  name: string;
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

interface DashboardClientProps {
  floors: Floor[];
  rooms: Room[];
  todayBookingsCount: number;
  availableNow: number;
  totalRooms: number;
}

export function DashboardClient({
  floors,
  rooms,
  todayBookingsCount,
  availableNow,
  totalRooms,
}: DashboardClientProps) {
  const stats = [
    {
      label: "Total Lantai",
      value: floors.length,
      icon: Building2,
      color: "from-blue-500 to-blue-600",
      shadowColor: "shadow-blue-500/20",
    },
    {
      label: "Total Ruangan",
      value: totalRooms,
      icon: DoorOpen,
      color: "from-purple-500 to-purple-600",
      shadowColor: "shadow-purple-500/20",
    },
    {
      label: "Booking Hari Ini",
      value: todayBookingsCount,
      icon: CalendarDays,
      color: "from-amber-500 to-orange-500",
      shadowColor: "shadow-amber-500/20",
    },
    {
      label: "Tersedia Sekarang",
      value: availableNow,
      icon: CheckCircle2,
      color: "from-emerald-500 to-green-600",
      shadowColor: "shadow-emerald-500/20",
    },
  ];

  const roomTypeLabels: Record<string, string> = {
    small: "Kecil",
    medium: "Sedang",
    large: "Besar",
    boardroom: "Boardroom",
  };

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Selamat datang di Sistem Booking Ruang Meeting
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`relative overflow-hidden rounded-xl bg-card border border-border p-5 shadow-lg ${stat.shadowColor}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-3xl font-bold mt-1">{stat.value}</p>
              </div>
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}
              >
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            {/* Decorative gradient */}
            <div
              className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.color}`}
            />
          </div>
        ))}
      </div>

      {/* Floor cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Lantai & Ruangan</h2>
          <Link
            href="/roombook/rooms"
            className="text-sm text-blue-500 hover:text-blue-400 flex items-center gap-1 transition-colors"
          >
            Lihat Semua <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {floors.length === 0 ? (
          <div className="text-center py-12 bg-card border border-border rounded-xl">
            <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              Belum ada data lantai. Silakan tambahkan lantai terlebih dahulu.
            </p>
            <Link
              href="/roombook/floors"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Building2 className="w-4 h-4" />
              Kelola Lantai
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {floors.map((floor) => {
              const floorRooms = rooms.filter(
                (r) => r.floorId === floor.id && r.isActive
              );
              return (
                <div
                  key={floor.id}
                  className="bg-card border border-border rounded-xl p-5 hover:border-blue-500/30 transition-all duration-300 group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center text-blue-500 font-bold">
                        {floor.floorNumber}
                      </div>
                      <div>
                        <h3 className="font-semibold">{floor.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {floorRooms.length} ruangan
                        </p>
                      </div>
                    </div>
                  </div>

                  {floorRooms.length > 0 ? (
                    <div className="space-y-2">
                      {floorRooms.map((room) => (
                        <Link
                          key={room.id}
                          href={`/roombook/rooms/${room.id}`}
                          className="flex items-center justify-between p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <DoorOpen className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {room.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Users className="w-3 h-3" />
                            <span>{room.capacity} orang</span>
                            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-medium">
                              {roomTypeLabels[room.roomType] || room.roomType}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Belum ada ruangan
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
