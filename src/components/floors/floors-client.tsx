"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createFloor, deleteFloor, updateFloor } from "@/actions/floor-actions";
import {
  Building2,
  Plus,
  Trash2,
  Pencil,
  X,
  Loader2,
  DoorOpen,
} from "lucide-react";

interface Floor {
  id: number;
  name: string;
  floorNumber: number;
}

interface Room {
  id: number;
  name: string;
  floorId: number;
  isActive: boolean;
}

interface FloorsClientProps {
  floors: Floor[];
  rooms: Room[];
  isAdmin: boolean;
}

export function FloorsClient({ floors, rooms, isAdmin }: FloorsClientProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingFloor, setEditingFloor] = useState<Floor | null>(null);
  const [name, setName] = useState("");
  const [floorNumber, setFloorNumber] = useState("");
  const [editName, setEditName] = useState("");
  const [editFloorNumber, setEditFloorNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFloor) return;
    setError("");
    setLoading(true);
    try {
      await updateFloor(editingFloor.id, {
        name: editName,
        floorNumber: parseInt(editFloorNumber),
      });
      setEditingFloor(null);
      setEditName("");
      setEditFloorNumber("");
      router.refresh();
    } catch {
      setError("Gagal memperbarui lantai. Pastikan nomor lantai belum digunakan.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createFloor({
        name,
        floorNumber: parseInt(floorNumber),
      });
      setName("");
      setFloorNumber("");
      setShowForm(false);
      router.refresh();
    } catch {
      setError("Gagal membuat lantai. Pastikan nomor lantai belum digunakan.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const floorRooms = rooms.filter((r) => r.floorId === id);
    if (floorRooms.length > 0) {
      alert(
        "Tidak bisa menghapus lantai yang masih memiliki ruangan. Hapus ruangan terlebih dahulu."
      );
      return;
    }
    if (!confirm("Yakin ingin menghapus lantai ini?")) return;
    try {
      await deleteFloor(id);
      router.refresh();
    } catch {
      alert("Gagal menghapus lantai.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold">Kelola Lantai</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {floors.length} lantai terdaftar
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Tambah Lantai
          </button>
        )}
      </div>

      {/* Edit Floor Form */}
      {editingFloor && (
        <div className="bg-card border border-blue-500/30 rounded-xl p-5 ring-1 ring-blue-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-blue-400">Edit Lantai: {editingFloor.name}</h3>
            <button
              onClick={() => setEditingFloor(null)}
              className="p-1 rounded hover:bg-accent"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleUpdate} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Nama Lantai *
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
                className="w-full px-3 py-2 bg-accent/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div className="w-full sm:w-32 space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Nomor Lantai *
              </label>
              <input
                type="number"
                min="1"
                value={editFloorNumber}
                onChange={(e) => setEditFloorNumber(e.target.value)}
                required
                className="w-full px-3 py-2 bg-accent/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => setEditingFloor(null)}
                className="px-4 py-2 bg-card border border-border rounded-lg text-sm font-medium hover:bg-accent transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Perbarui
              </button>
            </div>
          </form>
          {error && (
            <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Tambah Lantai Baru</h3>
            <button
              onClick={() => setShowForm(false)}
              className="p-1 rounded hover:bg-accent"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Nama Lantai *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Lantai 1"
                required
                className="w-full px-3 py-2 bg-accent/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div className="w-full sm:w-32 space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                Nomor *
              </label>
              <input
                type="number"
                min="1"
                value={floorNumber}
                onChange={(e) => setFloorNumber(e.target.value)}
                placeholder="1"
                required
                className="w-full px-3 py-2 bg-accent/50 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg text-sm font-medium shadow-lg shadow-blue-500/20 disabled:opacity-50 flex items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Simpan
              </button>
            </div>
          </form>
          {error && (
            <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>
      )}

      {/* Floor cards */}
      {floors.length === 0 ? (
        <div className="text-center py-12 bg-card border border-border rounded-xl">
          <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Belum ada data lantai.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {floors.map((floor) => {
            const floorRooms = rooms.filter(
              (r) => r.floorId === floor.id && r.isActive
            );
            return (
              <div
                key={floor.id}
                className="bg-card border border-border rounded-xl p-5 hover:border-blue-500/30 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center">
                      <span className="text-xl font-bold text-blue-500">
                        {floor.floorNumber}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{floor.name}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <DoorOpen className="w-3 h-3" />
                        {floorRooms.length} ruangan
                      </p>
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => {
                          setEditingFloor(floor);
                          setEditName(floor.name);
                          setEditFloorNumber(String(floor.floorNumber));
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="p-2 rounded-lg hover:bg-blue-500/10 text-muted-foreground hover:text-blue-400 transition-colors"
                        title="Edit Lantai"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(floor.id)}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                        title="Hapus Lantai"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {floorRooms.length > 0 && (
                  <div className="space-y-1">
                    {floorRooms.map((room) => (
                      <div
                        key={room.id}
                        className="text-sm text-muted-foreground flex items-center gap-2 py-1"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        {room.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
