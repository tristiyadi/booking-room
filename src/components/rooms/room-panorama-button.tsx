"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Compass } from "lucide-react";
import { RoomPanorama } from "./room-panorama";

interface RoomPanoramaButtonProps {
  panoramaUrl: string;
  roomName: string;
  className?: string;
  buttonText?: string;
}

export function RoomPanoramaButton({ panoramaUrl, roomName, className, buttonText }: RoomPanoramaButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className || "flex items-center gap-2 px-4 py-2 border border-blue-500/30 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 cursor-pointer font-medium rounded-md text-sm transition-colors"}
      >
        <Compass className="w-4 h-4" />
        {buttonText || "Lihat Ruangan 360°"}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl w-[95vw] md:w-[90vw] p-5 bg-card border-border shadow-2xl rounded-2xl">
          <DialogHeader className="mb-3">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-500" />
              Visualisasi 360° — {roomName}
            </DialogTitle>
          </DialogHeader>
          {open && <RoomPanorama src={panoramaUrl} />}
        </DialogContent>
      </Dialog>
    </>
  );
}
