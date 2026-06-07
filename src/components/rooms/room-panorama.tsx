"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, AlertTriangle } from "lucide-react";

interface RoomPanoramaProps {
  src: string;
}

export function RoomPanorama({ src }: RoomPanoramaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let destroyed = false;

    async function initViewer() {
      try {
        // Dynamic import to avoid SSR issues with three.js / WebGL
        const { Viewer } = await import("@photo-sphere-viewer/core");

        // Also dynamically load the CSS
        await import("@photo-sphere-viewer/core/index.css");

        if (destroyed || !containerRef.current) return;

        const viewer = new Viewer({
          container: containerRef.current,
          panorama: src,
          caption: "Kondisi Aktual Ruangan",
          defaultZoomLvl: 20,
          touchmoveTwoFingers: false,
          mousewheelCtrlKey: false,
          navbar: [
            "zoomOut",
            "zoomIn",
            "fullscreen",
            "caption",
          ],
        });

        viewerRef.current = viewer;

        viewer.addEventListener("ready", () => {
          if (!destroyed) {
            setLoading(false);
          }
        });
      } catch (err) {
        console.error("Failed to initialize Photo Sphere Viewer:", err);
        if (!destroyed) {
          setError(
            err instanceof Error ? err.message : "Gagal memuat panorama 360°"
          );
          setLoading(false);
        }
      }
    }

    initViewer();

    return () => {
      destroyed = true;
      if (viewerRef.current) {
        try {
          (viewerRef.current as { destroy: () => void }).destroy();
        } catch {
          // ignore destroy errors
        }
        viewerRef.current = null;
      }
    };
  }, [src]);

  return (
    <div className="relative w-full h-[55vh] md:h-[65vh] bg-slate-950 rounded-xl overflow-hidden border border-border">
      {loading && !error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/80 backdrop-blur-sm gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-sm font-medium text-slate-300">Memuat Visualisasi 360°...</p>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-sm gap-3">
          <AlertTriangle className="w-10 h-10 text-amber-500" />
          <p className="text-sm font-medium text-red-400 text-center max-w-md px-4">
            {error}
          </p>
          <p className="text-xs text-slate-500 text-center max-w-md px-4">
            Pastikan browser mendukung WebGL dan gambar panorama tersedia.
          </p>
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}
