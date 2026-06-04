# PRD — Meeting Room Booking Management System

## 1. Overview

### 1.1 Latar Belakang

Perusahaan memiliki gedung pertemuan dengan beberapa lantai dan banyak ruang meeting yang digunakan bersama oleh berbagai divisi. Saat ini proses reservasi ruangan masih dilakukan secara manual sehingga sering terjadi bentrok jadwal, kesulitan melihat ketersediaan ruangan, dan kurangnya visibilitas terhadap penggunaan fasilitas gedung.

Meeting Room Booking Management System dibuat untuk memudahkan karyawan melihat ketersediaan ruangan secara real-time, melakukan reservasi, serta membantu administrator mengelola seluruh fasilitas meeting dalam satu platform terpusat.

### 1.2 Tujuan Produk

* Menyediakan informasi ketersediaan ruangan secara real-time.
* Mengurangi konflik jadwal dan double booking.
* Mempermudah proses reservasi ruangan meeting.
* Menyediakan dashboard monitoring penggunaan ruangan.
* Menyediakan laporan okupansi dan utilisasi ruangan.

### 1.3 Ruang Lingkup

MVP mencakup:

* Login dan autentikasi pengguna.
* Manajemen lantai dan ruangan.
* Booking meeting room.
* Dashboard ketersediaan ruangan.
* Kalender jadwal ruangan.
* Pembatalan booking.
* Manajemen pengguna dan role.

---

## 2. Requirements

### 2.1 Functional Requirements

#### Authentication

* User dapat login.
* User dapat logout.
* Role-based access (Admin dan User).

#### Room Management

* Admin dapat membuat, mengubah, dan menghapus room.
* Admin dapat mengelompokkan room berdasarkan lantai.
* Admin dapat menentukan kapasitas room.

#### Booking Management

* User dapat melihat jadwal room.
* User dapat membuat booking.
* User dapat membatalkan booking miliknya.
* Sistem mencegah double booking.

#### Dashboard

* Menampilkan seluruh lantai.
* Filter berdasarkan lantai.
* Menampilkan room kosong dan terbooking.
* Menampilkan rentang waktu booking aktif.

### 2.2 Non Functional Requirements

* Responsive design.
* Mobile dan tablet friendly.
* Load page < 2 detik.
* Mendukung minimal 200 concurrent booking per hari.
* Data tersimpan secara lokal menggunakan SQLite.

### 2.3 Business Requirements

* Mengurangi konflik penggunaan ruangan.
* Mempermudah koordinasi antar divisi.
* Menyediakan audit trail penggunaan ruangan.

---

## 3. Core Features

### MVP Features

#### Dashboard Availability

Menampilkan:

* Semua lantai
* Semua room
* Status room
* Jam booking aktif

#### Room Booking

* Create booking
* Edit booking
* Cancel booking

#### Calendar View

* Daily View
* Weekly View
* Monthly View

#### Room Management

* CRUD Room
* CRUD Floor

#### User Management

* CRUD User
* Role Management

---

## 4. User Flow

### Booking Flow

Login

↓

Dashboard

↓

Pilih Lantai

↓

Pilih Room

↓

Lihat Jadwal

↓

Pilih Waktu

↓

Submit Booking

↓

Validasi Konflik Jadwal

↓

Booking Berhasil

---

## 5. Architecture

### Frontend

* Next.js 16 App Router
* TypeScript
* Tailwind CSS v4
* Shadcn/UI
* Zustand

### Backend

* Next.js Server Actions
* Route Handlers
* Zod Validation

### Database

* SQLite
* Drizzle ORM

### Authentication

* Better Auth

---

## 6. Database Schema

### 6.1 Entity Relationship Diagram

Floor

└── Room

└── Booking

└── User

### 6.2 Main Tables

#### floors

| Column       | Type    |
| ------------ | ------- |
| id           | integer |
| name         | text    |
| floor_number | integer |

#### rooms

| Column    | Type    |
| --------- | ------- |
| id        | integer |
| floor_id  | integer |
| name      | text    |
| capacity  | integer |
| room_type | text    |
| is_active | boolean |

#### users

| Column | Type |
| ------ | ---- |
| id     | text |
| name   | text |
| email  | text |
| role   | text |

#### bookings

| Column      | Type     |
| ----------- | -------- |
| id          | integer  |
| room_id     | integer  |
| user_id     | text     |
| title       | text     |
| description | text     |
| start_time  | datetime |
| end_time    | datetime |
| status      | text     |

### 6.3 Booking Rules

Sistem harus menolak booking jika:

* Room sama
* Waktu overlap
* Status booking masih aktif

---

## 6.4 Drizzle ORM Structure

db/

├── schema/

│ ├── floors.ts

│ ├── rooms.ts

│ ├── users.ts

│ └── bookings.ts

├── index.ts

└── migrations/

---

## 6.5 Migration Commands

npx drizzle-kit generate

npx drizzle-kit migrate

npx drizzle-kit studio

---

## 7. Tech Stack

| Layer            | Technology      |
| ---------------- | --------------- |
| Framework        | Next.js 16      |
| Language         | TypeScript      |
| UI               | Shadcn/UI       |
| Styling          | Tailwind CSS v4 |
| State Management | Zustand         |
| Validation       | Zod             |
| ORM              | Drizzle ORM     |
| Database         | SQLite          |
| Authentication   | Better Auth     |
| Calendar         | FullCalendar    |

---

## 8. Design Guidelines

### Design Principles

* Clean
* Corporate
* Modern
* Mobile First

### Color Palette

Primary

* Blue

Success

* Green

Warning

* Yellow

Danger

* Red

Neutral

* Gray

### Main Components

* Card
* Badge
* Dialog
* Table
* Calendar
* Tabs
* Select
* Sheet
* Skeleton

---

## 9. Future Roadmap

### V2

* Approval Workflow
* QR Check-In
* Outlook Integration
* Google Calendar Integration
* Recurring Meeting
* Email Notification

### V3

* Interactive Floor Map
* Meeting Room Display TV
* Occupancy Analytics
* Heatmap Utilization
* AI Scheduling Assistant
