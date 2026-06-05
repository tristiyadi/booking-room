"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventInput, DateSelectArg, EventClickArg } from "@fullcalendar/core";
import { BookingDialog } from "@/components/calendar/booking-dialog";
import { toast } from "sonner";

interface Booking {
  id: number;
  title: string;
  description: string | null;
  startTime: string;
  endTime: string;
  status: string;
  userId: string;
}

interface RoomCalendarProps {
  roomId: number;
  roomName: string;
  bookings: Booking[];
  userId: string;
}

export function RoomCalendar({
  roomId,
  roomName,
  bookings,
  userId,
}: RoomCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{
    start: string;
    end: string;
  } | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [currentView, setCurrentView] = useState("timeGridWeek");

  const events: EventInput[] = bookings.map((booking) => ({
    id: String(booking.id),
    title: booking.title,
    start: booking.startTime,
    end: booking.endTime,
    backgroundColor:
      booking.status === "cancelled"
        ? "#6b7280"
        : booking.userId === userId
          ? "#3b82f6"
          : "#8b5cf6",
    borderColor:
      booking.status === "cancelled"
        ? "#4b5563"
        : booking.userId === userId
          ? "#2563eb"
          : "#7c3aed",
    textColor: "#ffffff",
    extendedProps: {
      description: booking.description,
      status: booking.status,
      bookingUserId: booking.userId,
    },
  }));

  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();

    const now = new Date();
    const end = new Date(selectInfo.end);
    if (end < now) {
      toast.error("Tidak dapat membuat booking di masa lampau.");
      return;
    }

    setSelectedRange({
      start: selectInfo.startStr,
      end: selectInfo.endStr,
    });
    setSelectedBooking(null);
    setDialogOpen(true);
  }, []);

  const handleEventClick = useCallback(
    (clickInfo: EventClickArg) => {
      const booking = bookings.find(
        (b) => String(b.id) === clickInfo.event.id
      );
      if (booking) {
        setSelectedBooking(booking);
        setSelectedRange(null);
        setDialogOpen(true);
      }
    },
    [bookings]
  );

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedRange(null);
    setSelectedBooking(null);
  };

  return (
    <div className="space-y-4">
      {/* View switcher */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { key: "timeGridDay", label: "Hari" },
          { key: "timeGridWeek", label: "Minggu" },
          { key: "dayGridMonth", label: "Bulan" },
        ].map((view) => (
          <button
            key={view.key}
            onClick={() => {
              setCurrentView(view.key);
              calendarRef.current?.getApi().changeView(view.key);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${currentView === view.key
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-card border border-border text-muted-foreground hover:bg-accent"
              }`}
          >
            {view.label}
          </button>
        ))}

        {/* Legend */}
        <div className="flex items-center gap-4 ml-auto text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-blue-500" />
            <span>Milik Anda</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-purple-500" />
            <span>Lainnya</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-gray-500" />
            <span>Dibatalkan</span>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-card border border-border rounded-xl p-2 sm:p-4 overflow-hidden calendar-wrapper">
        <FullCalendar
          ref={calendarRef}
          plugins={[timeGridPlugin, dayGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "",
          }}
          locale="id"
          buttonText={{
            today: "Hari Ini",
            month: "Bulan",
            week: "Minggu",
            day: "Hari",
          }}
          slotMinTime="07:00:00"
          slotMaxTime="22:00:00"
          slotDuration="00:30:00"
          slotLabelInterval="01:00:00"
          slotLabelFormat={{
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }}
          allDaySlot={false}
          nowIndicator={true}
          editable={false}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          events={events}
          select={handleDateSelect}
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
            day: "numeric",
            month: "short",
          }}
        />
      </div>

      <BookingDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        roomId={roomId}
        roomName={roomName}
        userId={userId}
        selectedRange={selectedRange}
        selectedBooking={selectedBooking}
      />
    </div>
  );
}
