# Meeting Room Booking Management System — MVP

Membangun MVP sistem booking ruang meeting berdasarkan [plan.md](file:///c:/dev/booking-room/plan.md). Hanya **Administrator** yang bisa login & melakukan booking. UI kalender mirip Google Calendar (FullCalendar) per room.

## User Review Required

> [!IMPORTANT]
> **Hanya Admin Login**: Sesuai permintaan, hanya role `admin` yang bisa login dan melakukan booking. Fitur registrasi ditiadakan — admin di-seed langsung ke database.

> [!IMPORTANT]
> **Seed Data**: Akan dibuat script seed untuk:
> - 1 admin default (email: `admin@company.com`, password: `admin123`)
> - 3 lantai dengan masing-masing 2-3 ruang meeting
> Apakah data seed ini sudah sesuai?

## Open Questions

> [!NOTE]
> **Jam Operasional**: Calendar akan menampilkan slot waktu 07:00 - 21:00. Apakah ini sesuai?

> [!NOTE]
> **Bahasa UI**: Apakah UI akan dalam Bahasa Indonesia atau Bahasa Inggris?

---

## Proposed Changes

### 1. Project Initialization

#### [NEW] Next.js 16 Project Setup

```bash
npx create-next-app@latest ./ --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --turbopack
```

#### [NEW] Dependencies

```bash
# Database
npm install drizzle-orm better-sqlite3
npm install -D drizzle-kit @types/better-sqlite3

# Authentication
npm install better-auth

# Calendar
npm install @fullcalendar/react @fullcalendar/core @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction

# State & Validation
npm install zustand zod

# UI Components
npx shadcn@latest init
npx shadcn@latest add button card dialog input label select tabs badge sheet skeleton separator dropdown-menu avatar toast sonner
```

---

### 2. Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout + font + providers
│   ├── page.tsx                # Redirect to /dashboard
│   ├── globals.css             # Global styles + FullCalendar overrides
│   ├── login/
│   │   └── page.tsx            # Login page (admin only)
│   ├── dashboard/
│   │   ├── layout.tsx          # Dashboard layout (sidebar + header)
│   │   ├── page.tsx            # Dashboard overview (floor cards)
│   │   ├── rooms/
│   │   │   ├── page.tsx        # Room management (CRUD)
│   │   │   └── [roomId]/
│   │   │       └── page.tsx    # Room calendar view (FullCalendar)
│   │   ├── floors/
│   │   │   └── page.tsx        # Floor management (CRUD)
│   │   └── bookings/
│   │       └── page.tsx        # All bookings list view
│   └── api/
│       ├── auth/[...all]/
│       │   └── route.ts        # Better Auth handler
│       ├── floors/
│       │   └── route.ts        # Floor CRUD API
│       ├── rooms/
│       │   └── route.ts        # Room CRUD API
│       └── bookings/
│           └── route.ts        # Booking CRUD API
├── components/
│   ├── ui/                     # Shadcn components
│   ├── layout/
│   │   ├── sidebar.tsx         # Dashboard sidebar navigation
│   │   ├── header.tsx          # Top header + user menu
│   │   └── mobile-nav.tsx      # Mobile navigation sheet
│   ├── dashboard/
│   │   ├── floor-card.tsx      # Floor card with room status
│   │   ├── room-status-badge.tsx
│   │   └── stats-overview.tsx  # Quick stats (total rooms, active bookings)
│   ├── calendar/
│   │   ├── room-calendar.tsx   # FullCalendar wrapper per room
│   │   ├── booking-dialog.tsx  # Create/edit booking modal
│   │   └── event-tooltip.tsx   # Hover tooltip for events
│   ├── rooms/
│   │   ├── room-form.tsx       # Create/edit room form
│   │   └── room-table.tsx      # Room list table
│   ├── floors/
│   │   ├── floor-form.tsx      # Create/edit floor form
│   │   └── floor-table.tsx     # Floor list table
│   └── bookings/
│       ├── booking-table.tsx   # All bookings table
│       └── booking-filters.tsx # Filter by room/floor/date
├── lib/
│   ├── auth.ts                 # Better Auth server config
│   ├── auth-client.ts          # Better Auth client
│   └── utils.ts                # Utility functions
├── db/
│   ├── index.ts                # Drizzle DB connection
│   ├── schema/
│   │   ├── floors.ts
│   │   ├── rooms.ts
│   │   ├── bookings.ts
│   │   └── index.ts            # Re-export all schemas
│   ├── seed.ts                 # Seed script
│   └── migrations/
├── stores/
│   └── booking-store.ts        # Zustand store
├── actions/
│   ├── floor-actions.ts        # Server actions for floors
│   ├── room-actions.ts         # Server actions for rooms
│   └── booking-actions.ts      # Server actions for bookings
└── middleware.ts               # Auth middleware (protect routes)
```

---

### 3. Database Layer

#### [NEW] `src/db/schema/floors.ts`
```typescript
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const floors = sqliteTable("floors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  floorNumber: integer("floor_number").notNull().unique(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});
```

#### [NEW] `src/db/schema/rooms.ts`
```typescript
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { floors } from "./floors";

export const rooms = sqliteTable("rooms", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  floorId: integer("floor_id").notNull().references(() => floors.id),
  name: text("name").notNull(),
  capacity: integer("capacity").notNull().default(10),
  roomType: text("room_type", { enum: ["small", "medium", "large", "boardroom"] }).default("medium"),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});
```

#### [NEW] `src/db/schema/bookings.ts`
```typescript
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { rooms } from "./rooms";

export const bookings = sqliteTable("bookings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  roomId: integer("room_id").notNull().references(() => rooms.id),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  startTime: text("start_time").notNull(), // ISO datetime
  endTime: text("end_time").notNull(),     // ISO datetime
  status: text("status", { enum: ["active", "cancelled"] }).default("active"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});
```

#### [NEW] `src/db/index.ts`
- Singleton Drizzle instance menggunakan `better-sqlite3`
- Database file: `sqlite.db` di root project

#### [NEW] `src/db/seed.ts`
- Seed 1 admin user via Better Auth
- Seed 3 floors (Lantai 1, Lantai 2, Lantai 3)
- Seed 7 rooms tersebar di 3 lantai dengan berbagai kapasitas

#### [NEW] `drizzle.config.ts`
- Schema path: `./src/db/schema`
- Out: `./drizzle/migrations`
- Dialect: `sqlite`

---

### 4. Authentication

#### [NEW] `src/lib/auth.ts`
- Better Auth dengan Drizzle adapter (SQLite)
- `emailAndPassword` enabled
- User table menggunakan Better Auth built-in (tambah field `role`)

#### [NEW] `src/lib/auth-client.ts`
- `createAuthClient()` untuk frontend

#### [NEW] `src/middleware.ts`
- Protect semua route `/dashboard/*`
- Redirect ke `/login` jika belum authenticated
- Cek role `admin` — reject non-admin

#### [NEW] `src/app/api/auth/[...all]/route.ts`
- Better Auth route handler

---

### 5. API Routes (Server Actions)

#### [NEW] `src/actions/floor-actions.ts`
- `getFloors()` — list all floors
- `createFloor(data)` — create floor
- `updateFloor(id, data)` — update floor
- `deleteFloor(id)` — delete floor (cascade check)

#### [NEW] `src/actions/room-actions.ts`
- `getRooms(floorId?)` — list rooms, optional filter by floor
- `getRoomById(id)` — single room with bookings
- `createRoom(data)` — create room
- `updateRoom(id, data)` — update room
- `deleteRoom(id)` — soft delete (set isActive=false)

#### [NEW] `src/actions/booking-actions.ts`
- `getBookings(roomId, dateRange)` — bookings for calendar
- `createBooking(data)` — create with overlap validation
- `updateBooking(id, data)` — update booking
- `cancelBooking(id)` — cancel (set status=cancelled)
- **Overlap validation**: Cek apakah ada booking aktif di room yang sama pada waktu yang overlap

---

### 6. Frontend — Pages & Components

#### [NEW] Login Page (`src/app/login/page.tsx`)
- Email & password form
- Clean, modern design dengan glassmorphism card
- Logo/brand di atas form
- Error handling untuk invalid credentials

#### [NEW] Dashboard Layout (`src/app/dashboard/layout.tsx`)
- Sidebar kiri dengan navigasi: Dashboard, Rooms, Floors, Bookings
- Top header dengan user info dan logout button
- Responsive: sidebar collapse di mobile → sheet drawer

#### [NEW] Dashboard Overview (`src/app/dashboard/page.tsx`)
- Stats cards: Total Floors, Total Rooms, Active Bookings Today, Available Rooms Now
- Floor cards grid — klik untuk lihat rooms di lantai tersebut
- Setiap floor card menampilkan jumlah room dan status terkini

#### [NEW] Room Calendar Page (`src/app/dashboard/rooms/[roomId]/page.tsx`)
**Ini adalah halaman utama — UI mirip Google Calendar**
- FullCalendar dengan view: Day, Week, Month
- Default view: `timeGridWeek`
- Slot waktu 07:00 — 21:00
- `nowIndicator` (garis merah waktu sekarang)
- Klik slot kosong → dialog create booking
- Klik event → dialog detail/edit/cancel booking
- Drag & drop untuk reschedule
- Warna event sesuai status (active=blue, cancelled=gray)
- Header menampilkan nama room, kapasitas, lantai

#### [NEW] Room Management (`src/app/dashboard/rooms/page.tsx`)
- Table daftar semua rooms dengan kolom: Name, Floor, Capacity, Type, Status
- Button Add Room → dialog form
- Actions: Edit, Delete, View Calendar
- Filter by floor

#### [NEW] Floor Management (`src/app/dashboard/floors/page.tsx`)
- Table daftar semua floors
- CRUD via dialog forms

#### [NEW] Bookings List (`src/app/dashboard/bookings/page.tsx`)
- Table semua bookings dengan filter
- Kolom: Room, Floor, Title, Date/Time, Status
- Action: Cancel booking

---

### 7. UI/UX Design System

#### Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| Primary | `hsl(221, 83%, 53%)` | #3B82F6 — Buttons, links, active states |
| Primary Dark | `hsl(221, 83%, 43%)` | Hover states |
| Success | `hsl(142, 71%, 45%)` | Available rooms, confirmed |
| Warning | `hsl(38, 92%, 50%)` | Warnings |
| Danger | `hsl(0, 84%, 60%)` | Cancel, delete, errors |
| Background | `hsl(222, 47%, 11%)` | Dark mode base |
| Surface | `hsl(217, 33%, 17%)` | Cards, panels |
| Border | `hsl(217, 19%, 27%)` | Borders |

#### Typography
- Font: **Inter** dari Google Fonts
- Heading sizes: 2xl, xl, lg (font-semibold)
- Body: base (font-normal)

#### Dark Mode Default
- Menggunakan dark mode sebagai default untuk kesan modern/premium
- Glassmorphism pada login card dan dialogs

#### FullCalendar Custom Styling
- Override CSS variables untuk match dark theme
- Custom event rendering dengan rounded corners
- Smooth transitions pada hover

---

### 8. State Management

#### [NEW] `src/stores/booking-store.ts`
```typescript
// Zustand store untuk:
// - Selected room
// - Selected date range  
// - Calendar view mode (day/week/month)
// - Booking form state
// - UI state (dialog open/close)
```

---

## Verification Plan

### Automated Tests
1. **Build test**: `npm run build` — pastikan zero errors
2. **Dev server**: `npm run dev` — pastikan halaman load < 2 detik
3. **Database**: Jalankan migrations dan seed, verifikasi data masuk

### Manual Verification
1. Login dengan admin credentials → berhasil masuk dashboard
2. Dashboard menampilkan floor cards dengan room counts
3. Klik room → calendar view tampil dengan Google Calendar style
4. Create booking via klik slot → booking muncul di calendar
5. Cancel booking → status berubah, warna event berubah
6. Overlap validation → coba book slot yang sudah terisi → error
7. Responsive test: resize browser → sidebar collapse, calendar adapt
8. CRUD Floor & Room → semua operasi berfungsi
