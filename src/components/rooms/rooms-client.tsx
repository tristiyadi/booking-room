"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createRoom, deleteRoom, updateRoom } from "@/actions/room-actions";
import {
  DoorOpen,
  Plus,
  CalendarDays,
  Users,
  Building2,
  Trash2,
  Pencil,
  X,
  Loader2,
  Upload,
  Image as ImageIcon,
  Compass,
} from "lucide-react";
import { RoomPanoramaButton } from "./room-panorama-button";

interface Room {
  id: number;
  name: string;
  capacity: number;
  roomType: string;
  isActive: boolean;
  floorId: number;
  floorName: string;
  floorNumber: number;
  facilities: string | null;
  panoramaUrl: string | null;
}

interface Floor {
  id: number;
  name: string;
  floorNumber: number;
}

interface RoomsClientProps {
  rooms: Room[];
  floors: Floor[];
  isAdmin: boolean;
}

export function RoomsClient({ rooms, floors, isAdmin }: RoomsClientProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [filterFloor, setFilterFloor] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    floorId: "",
    capacity: "10",
    roomType: "medium" as "small" | "medium" | "large" | "boardroom",
    facilities: "",
    panoramaUrl: "",
  });
  const [editFormData, setEditFormData] = useState({
    name: "",
    floorId: "",
    capacity: "10",
    roomType: "medium" as "small" | "medium" | "large" | "boardroom",
    facilities: "",
    panoramaUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [editUploading, setEditUploading] = useState(false);
  const createFileRef = useRef<HTMLInputElement>(null);
  const editFileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const uploadPanorama = async (file: File): Promise<string | null> => {
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    const res = await fetch("/api/upload/panorama", {
      method: "POST",
      body: formDataUpload,
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Gagal mengupload file.");
    }

    const data = await res.json();
    return data.url;
  };

  const handleCreateFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");
    try {
      const url = await uploadPanorama(file);
      if (url) {
        setFormData({ ...formData, panoramaUrl: url });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengupload file.");
    } finally {
      setUploading(false);
    }
  };

  const handleEditFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEditUploading(true);
    setError("");
    try {
      const url = await uploadPanorama(file);
      if (url) {
        setEditFormData({ ...editFormData, panoramaUrl: url });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal mengupload file.");
    } finally {
      setEditUploading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;
    setError("");
    setLoading(true);
    try {
      await updateRoom(editingRoom.id, {
        name: editFormData.name,
        floorId: parseInt(editFormData.floorId),
        capacity: parseInt(editFormData.capacity),
        roomType: editFormData.roomType,
        facilities: editFormData.facilities || null,
        panoramaUrl: editFormData.panoramaUrl || null,
      });
      setEditingRoom(null);
      router.refresh();
    } catch {
      setError("Gagal memperbarui ruangan.");
    } finally {
      setLoading(false);
    }
  };

  const filteredRooms = filterFloor
    ? rooms.filter((r) => r.floorId === filterFloor)
    : rooms;

  const activeRooms = filteredRooms.filter((r) => r.isActive);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createRoom({
        name: formData.name,
        floorId: parseInt(formData.floorId),
        capacity: parseInt(formData.capacity),
        roomType: formData.roomType,
        facilities: formData.facilities || null,
        panoramaUrl: formData.panoramaUrl || null,
      });
      setFormData({ name: "", floorId: "", capacity: "10", roomType: "medium", facilities: "", panoramaUrl: "" });
      setShowForm(false);
      router.refresh();
    } catch {
      setError("Gagal membuat ruangan.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menonaktifkan ruangan ini?")) return;
    try {
      await deleteRoom(id);
      router.refresh();
    } catch {
      alert("Gagal menghapus ruangan.");
    }
  };

  const roomTypeLabels: Record<string, string> = {
    small: "Kecil",
    medium: "Sedang",
    large: "Besar",
    boardroom: "Boardroom",
  };

  const roomTypeColors: Record<string, string> = {
    small: "bg-emerald-500/10 text-emerald-400",
    medium: "bg-blue-500/10 text-blue-400",
    large: "bg-purple-500/10 text-purple-400",
    boardroom: "bg-amber-500/10 text-amber-400",
  };

  // Reusable panorama upload field component
  const PanoramaUploadField = ({
    currentUrl,
    roomName,
    onRemove,
    onUploadClick,
    isUploading,
    fileInputRef,
    onFileChange,
  }: {
    currentUrl: string;
    roomName: string;
    onRemove: () => void;
    onUploadClick: () => void;
    isUploading: boolean;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }) => (
    <div className="space-y-2 sm:col-span-2">
      <label className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
        <Compass className="w-3.5 h-3.5" />
        Foto Panorama 360° (Equirectangular)
      </label>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onFileChange}
        className="hidden"
      />

      {currentUrl ? (
        /* Preview uploaded/existing panorama */
        <div className="relative group rounded-lg border border-border overflow-hidden bg-accent/30">
          <div className="flex items-center gap-3 p-3">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-border/50">
              <img
                src={currentUrl}
                alt="Preview panorama"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground truncate">
                {currentUrl}
              </p>
              <p className="text-[10px] text-emerald-500 font-medium mt-0.5 flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                Panorama terpasang
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
              <RoomPanoramaButton
                panoramaUrl={currentUrl}
                roomName={roomName || "Preview"}
                className="px-2.5 py-1.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-md transition-colors flex items-center gap-1"
                buttonText="Lihat 360°"
              />
              <button
                type="button"
                onClick={onUploadClick}
                disabled={isUploading}
                className="px-2.5 py-1.5 text-xs font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-md transition-colors disabled:opacity-50"
              >
                Ganti
              </button>
              <button
                type="button"
                onClick={onRemove}
                className="px-2.5 py-1.5 text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-md transition-colors"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Upload dropzone */
        <button
          type="button"
          onClick={onUploadClick}
          disabled={isUploading}
          className="w-full flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed border-border rounded-xl hover:border-blue-500/50 hover:bg-blue-500/5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
              <span className="text-sm text-muted-foreground">Mengupload...</span>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Upload className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-center">
                <span className="text-sm font-medium text-blue-400">Klik untuk upload gambar panorama</span>
                <p className="text-[10px] text-muted-foreground mt-0.5">JPEG, PNG, WebP • Maks 10MB</p>
              </div>
            </>
          )}
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Ruang Meeting</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {activeRooms.length} ruangan aktif
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Floor filter */}
          <select
            value={filterFloor || ""}
            onChange={(e) =>
              setFilterFloor(e.target.value ? parseInt(e.target.value) : null)
            }
            className="px-3 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="">Semua Lantai</option>
            {floors.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>

          {isAdmin && (
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Tambah Ruangan
            </button>
          )}
        </div>
      </div>

      {/* Edit form */}
      {editingRoom && (
        <div className="bg-card border border-blue-500/30 rounded-xl p-5 ring-1 ring-blue-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-blue-400">Edit Ruangan: {editingRoom.name}</h3>
            <button
              onClick={() => setEditingRoom(null)}
              className="p-1 rounded hover:bg-accent"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleUpdate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Nama Ruangan *
              </label>
              <input
                type="text"
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
                required
                className="w-full px-3 py-2 bg-accent/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Lantai *
              </label>
              <select
                value={editFormData.floorId}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, floorId: e.target.value })
                }
                required
                className="w-full px-3 py-2 bg-accent/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">Pilih Lantai</option>
                {floors.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Kapasitas
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={editFormData.capacity}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, capacity: e.target.value })
                }
                className="w-full px-3 py-2 bg-accent/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Tipe Ruangan
              </label>
              <select
                value={editFormData.roomType}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    roomType: e.target.value as any,
                  })
                }
                className="w-full px-3 py-2 bg-accent/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="small">Kecil (1-4 orang)</option>
                <option value="medium">Sedang (5-10 orang)</option>
                <option value="large">Besar (11-20 orang)</option>
                <option value="boardroom">Boardroom (20+ orang)</option>
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium text-muted-foreground">
                Fasilitas (contoh: Monitor, TV, Piano, dll)
              </label>
              <textarea
                value={editFormData.facilities}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, facilities: e.target.value })
                }
                placeholder="Ada monitor, TV, ada Piano, proyektor, papan tulis, dll"
                rows={2}
                className="w-full px-3 py-2 bg-accent/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            {/* Panorama upload for edit */}
            <PanoramaUploadField
              currentUrl={editFormData.panoramaUrl}
              roomName={editFormData.name}
              onRemove={() => setEditFormData({ ...editFormData, panoramaUrl: "" })}
              onUploadClick={() => editFileRef.current?.click()}
              isUploading={editUploading}
              fileInputRef={editFileRef}
              onFileChange={handleEditFileChange}
            />

            {error && (
              <div className="sm:col-span-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="sm:col-span-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingRoom(null)}
                className="px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-accent transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading || editUploading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Perbarui
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Tambah Ruangan Baru</h3>
            <button
              onClick={() => setShowForm(false)}
              className="p-1 rounded hover:bg-accent"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Nama Ruangan *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Contoh: Ruang Rapat A"
                required
                className="w-full px-3 py-2 bg-accent/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Lantai *
              </label>
              <select
                value={formData.floorId}
                onChange={(e) =>
                  setFormData({ ...formData, floorId: e.target.value })
                }
                required
                className="w-full px-3 py-2 bg-accent/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="">Pilih Lantai</option>
                {floors.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Kapasitas
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.capacity}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: e.target.value })
                }
                className="w-full px-3 py-2 bg-accent/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Tipe Ruangan
              </label>
              <select
                value={formData.roomType}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    roomType: e.target.value as typeof formData.roomType,
                  })
                }
                className="w-full px-3 py-2 bg-accent/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="small">Kecil (1-4 orang)</option>
                <option value="medium">Sedang (5-10 orang)</option>
                <option value="large">Besar (11-20 orang)</option>
                <option value="boardroom">Boardroom (20+ orang)</option>
              </select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium text-muted-foreground">
                Fasilitas (contoh: Monitor, TV, Piano, dll)
              </label>
              <textarea
                value={formData.facilities}
                onChange={(e) =>
                  setFormData({ ...formData, facilities: e.target.value })
                }
                placeholder="Ada monitor, TV, ada Piano, proyektor, papan tulis, dll"
                rows={2}
                className="w-full px-3 py-2 bg-accent/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            {/* Panorama upload for create */}
            <PanoramaUploadField
              currentUrl={formData.panoramaUrl}
              roomName={formData.name}
              onRemove={() => setFormData({ ...formData, panoramaUrl: "" })}
              onUploadClick={() => createFileRef.current?.click()}
              isUploading={uploading}
              fileInputRef={createFileRef}
              onFileChange={handleCreateFileChange}
            />

            {error && (
              <div className="sm:col-span-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="sm:col-span-2 flex justify-end">
              <button
                type="submit"
                disabled={loading || uploading}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Room cards */}
      {activeRooms.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <DoorOpen className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Belum ada ruangan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeRooms.map((room) => (
            <div
              key={room.id}
              className="bg-card border border-border rounded-xl overflow-hidden hover:border-blue-500/30 transition-all duration-300 group"
            >
              {/* Panorama thumbnail */}
              {room.panoramaUrl && (
                <div className="relative h-32 w-full overflow-hidden bg-slate-900">
                  <img
                    src={room.panoramaUrl}
                    alt={`Panorama ${room.name}`}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                  />
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-md text-[10px] text-white font-medium">
                    <Compass className="w-3 h-3" />
                    360°
                  </div>
                </div>
              )}

              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                      <DoorOpen className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{room.name}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {room.floorName}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${roomTypeColors[room.roomType] || "bg-blue-500/10 text-blue-400"}`}
                  >
                    {roomTypeLabels[room.roomType] || room.roomType}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Users className="w-4 h-4" />
                  <span>Kapasitas: {room.capacity} orang</span>
                </div>

                {room.facilities && (
                  <div className="mb-4 space-y-1.5">
                    <span className="text-xs font-semibold text-muted-foreground block">Fasilitas:</span>
                    <div className="flex flex-wrap gap-1">
                      {room.facilities.split(",").map((f, idx) => {
                        const facility = f.trim();
                        if (!facility) return null;
                        return (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded bg-accent/50 text-accent-foreground border border-border/50 text-[10px] font-medium transition-colors hover:bg-accent"
                          >
                            {facility}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Link
                    href={`/roombook/rooms/${room.id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-sm font-medium transition-colors"
                  >
                    <CalendarDays className="w-4 h-4" />
                    Lihat Jadwal
                  </Link>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingRoom(room);
                          setEditFormData({
                            name: room.name,
                            floorId: String(room.floorId),
                            capacity: String(room.capacity),
                            roomType: room.roomType as any,
                            facilities: room.facilities || "",
                            panoramaUrl: room.panoramaUrl || "",
                          });
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors"
                        title="Edit Ruangan"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(room.id)}
                        className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                        title="Nonaktifkan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
