import { db } from "./index";
import { floors, rooms, bookings, user, session, account, verification } from "./schema";
import { auth } from "../lib/auth";

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await db.delete(bookings);
  await db.delete(rooms);
  await db.delete(floors);
  await db.delete(session);
  await db.delete(account);
  await db.delete(verification);
  await db.delete(user);

  console.log("🔐 Seeding admin user...");
  const adminUser = await auth.api.signUpEmail({
    body: {
      email: "admin@company.com",
      password: "admin123",
      name: "Administrator",
      role: "admin",
    },
  });
  console.log(`✅ Admin user dibuat: ${adminUser.user.email}`);

  // Seed 4 floors
  const floorData = [
    { name: "Lantai 1", floorNumber: 1 },
    { name: "Lantai 2", floorNumber: 2 },
    { name: "Lantai 3", floorNumber: 3 },
    { name: "Lantai 4", floorNumber: 4 },
  ];

  const insertedFloors = await db.insert(floors).values(floorData).returning();
  console.log(`✅ ${insertedFloors.length} lantai dibuat`);

  // Seed rooms per floor
  const roomData = [
    // Lantai 1 - 3 rooms
    {
      floorId: insertedFloors[0].id,
      name: "Ruang Garuda",
      capacity: 8,
      roomType: "medium" as const,
      facilities: "Monitor TV 55 Inch, Papan Tulis, Proyektor",
      panoramaUrl: "/panoramas/garuda_360.png",
    },
    {
      floorId: insertedFloors[0].id,
      name: "Ruang Cendrawasih",
      capacity: 4,
      roomType: "small" as const,
      facilities: "Televisi, Papan Tulis",
      panoramaUrl: "/panoramas/cendrawasih_360.png",
    },
    {
      floorId: insertedFloors[0].id,
      name: "Ruang Merak",
      capacity: 6,
      roomType: "small" as const,
      facilities: "Papan Tulis, Speakerphone",
      panoramaUrl: "/panoramas/merak_360.png",
    },
    // Lantai 2 - 3 rooms
    {
      floorId: insertedFloors[1].id,
      name: "Ruang Komodo",
      capacity: 12,
      roomType: "large" as const,
      facilities: "Monitor TV 65 Inch, Papan Tulis, Sound System, Mic",
      panoramaUrl: "/panoramas/komodo_360.png",
    },
    {
      floorId: insertedFloors[1].id,
      name: "Ruang Anoa",
      capacity: 8,
      roomType: "medium" as const,
      facilities: "Monitor TV 55 Inch, Papan Tulis, AC",
      panoramaUrl: "/panoramas/anoa_360.png",
    },
    {
      floorId: insertedFloors[1].id,
      name: "Ruang Banteng",
      capacity: 6,
      roomType: "small" as const,
      facilities: "Papan Tulis, AC",
      panoramaUrl: "/panoramas/banteng_360.png",
    },
    // Lantai 3 - 2 rooms
    {
      floorId: insertedFloors[2].id,
      name: "Ruang Rajawali",
      capacity: 20,
      roomType: "boardroom" as const,
      facilities: "Proyektor Layar Lebar, Smart Board, Sound System, Video Conference Kit",
      panoramaUrl: "/panoramas/rajawali_360.png",
    },
    {
      floorId: insertedFloors[2].id,
      name: "Ruang Elang",
      capacity: 10,
      roomType: "medium" as const,
      facilities: "Monitor TV 55 Inch, Papan Tulis, AC",
      panoramaUrl: "/panoramas/elang_360.png",
    },
    // Lantai 4 - 2 rooms
    {
      floorId: insertedFloors[3].id,
      name: "Ruang Nusantara",
      capacity: 30,
      roomType: "boardroom" as const,
      facilities: "Proyektor Layar Lebar, Sound System, Piano, Stage, Video Conference Kit, TV 85 Inch",
      panoramaUrl: "/panoramas/nusantara_360.png",
    },
    {
      floorId: insertedFloors[3].id,
      name: "Ruang Pancasila",
      capacity: 15,
      roomType: "large" as const,
      facilities: "Proyektor, Smart Board, Sound System, AC",
      panoramaUrl: "/panoramas/pancasila_360.png",
    },
  ];

  const insertedRooms = await db.insert(rooms).values(roomData).returning();
  console.log(`✅ ${insertedRooms.length} ruangan dibuat`);

  console.log("");
  console.log("📋 Ringkasan Seed:");
  for (const floor of insertedFloors) {
    const floorRooms = insertedRooms.filter((r) => r.floorId === floor.id);
    console.log(`   ${floor.name}: ${floorRooms.length} ruangan`);
    for (const room of floorRooms) {
      console.log(
        `     - ${room.name} (${room.roomType}, ${room.capacity} orang)`
      );
    }
  }

  console.log("");
  console.log("🔐 Akun Admin Default:");
  console.log("   Email: admin@company.com");
  console.log("   Password: admin123");
  console.log("");
  console.log("✨ Seeding selesai!");
}

seed().catch((err) => {
  console.error("❌ Seed gagal:", err);
  process.exit(1);
});
