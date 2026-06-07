# 🏛️ RoomBookMeet Web — Meeting Room Booking System

**RoomBook** adalah aplikasi untuk manajemen dan pemesanan ruang rapat (meeting room) yang dirancang secara modern, responsif, dan kaya estetika. Aplikasi ini mendukung penuh mode Terang/Gelap dengan transisi animasi premium, dukungan Progressive Web App (PWA), serta ditenagai oleh **Neon Database (Serverless PostgreSQL)** dan **Better Auth**.

---

## ✨ Fitur Utama

1. **📅 Kalender Interaktif Publik & Privat**
   * **Landing Page Publik**: Tamu (tanpa login) dapat melihat ketersediaan jadwal pemakaian semua ruangan melalui kalender bulanan (`FullCalendar`), memfilter berdasarkan ruangan, dan melihat detail rapat melalui modal popup *read-only*.
   * **Kalender Detail Per Ruangan**: Pengguna terautentikasi dapat melihat jadwal per ruangan dengan tampilan harian, mingguan, dan bulanan, serta membuat pemesanan langsung dengan mengeklik atau memblok slot waktu kosong.

2. **🚫 Proteksi Pemesanan Masa Lampau (Past Booking Prevention)**
   * **Validasi Client-Side**: Kalender secara otomatis mendeteksi jika pengguna mencoba memesan slot waktu yang sudah terlewat (di masa lalu). Pilihan akan dibatalkan secara instan, pemesanan diblokir, dan toast error akan muncul: *"Tidak dapat membuat booking di masa lampau."*
   * **Validasi Server-Side**: Server Action `createBooking` menerapkan validasi ketat untuk menolak pembuatan jadwal pemesanan di masa lalu guna menjaga integritas data database.

3. **🌓 Dark & Light Mode dengan Circular ClipPath Transition**
   * Mendukung penuh mode Terang, Gelap, dan Sistem (mengikuti OS) menggunakan `next-themes`.
   * Integrasi **Circular View Transition API** (`document.startViewTransition`) saat berganti tema, memberikan efek animasi lingkaran ekspansi yang melebar halus dari titik koordinat klik pengguna.

4. **📱 Progressive Web App (PWA) & Custom Install Button**
   * Terdaftar sebagai aplikasi PWA dengan manifest lengkap (`manifest.webmanifest`) dan ikon beresolusi tinggi (512x512 & 192x192 PNG).
   * **Service Worker Caching**: Strategi *Stale-While-Revalidate* untuk mempercepat pemuatan aset statis dan menyediakan halaman fallback offline.
   * **Custom Install CTA**: Tombol "Pasang Aplikasi" di area Navbar & Hero yang otomatis terdeteksi dan disembunyikan jika aplikasi sudah terpasang di perangkat pengguna (*standalone mode*).

5. **💼 Manajemen Admin Lengkap (CRUD)**
   * **Lantai**: Admin dapat membuat, membaca, memperbarui (nama & nomor lantai), serta menghapus lantai.
   * **Ruangan**: Admin dapat mengelola ruangan, mengatur kapasitas, tipe ruangan, status aktif/nonaktif, serta menambahkan daftar fasilitas ruangan.
   * **Pills Fasilitas**: Fasilitas ruangan diubah dari teks koma menjadi elemen visual berbentuk badge/pills yang rapi dan elegan.

6. **🌍 Navigasi Cepat Dashboard ke Beranda**
   * Ikon **Globe** di samping Theme Toggle di header dashboard memudahkan Admin/User untuk berpindah kembali ke Halaman Utama publik dengan satu klik tanpa perlu keluar/logout dari aplikasi.

---

## 🛠️ Stack Teknologi

* **Framework**: [Next.js 16 (App Router)](https://nextjs.org/) dengan compiler **Turbopack**
* **Database & ORM**: [Neon Serverless PostgreSQL](https://neon.tech/) & [Drizzle ORM](https://orm.drizzle.team/)
* **Autentikasi**: [Better Auth](https://www.better-auth.com/) (menggunakan PostgreSQL adapter)
* **Kalender**: [FullCalendar React Widget](https://fullcalendar.io/)
* **Styling**: [TailwindCSS v4](https://tailwindcss.com/) & [Shadcn UI](https://ui.shadcn.com/)
* **Ikon**: [Lucide React](https://lucide.dev/)
* **Notifikasi**: [Sonner Toast](https://github.com/emilkowalski/sonner)

---

## ⚙️ Persyaratan Sistem & Konfigurasi Lingkungan

Sebelum menjalankan aplikasi secara lokal, pastikan Anda telah menyiapkan akun dan database di **Neon Console** untuk mendapatkan koneksi string PostgreSQL.

Buat file `.env` di direktori utama proyek dan lengkapi variabel berikut:

```env
# Better Auth Secret (Bisa diganti dengan string acak/secure key)
BETTER_AUTH_SECRET=meeting-room-booking-secret-key-2024-very-secure

# Better Auth URL (Gunakan URL local development)
BETTER_AUTH_URL=http://localhost:3000

# Neon Database URL (Salin koneksi string PostgreSQL serverless dari dashboard Neon Anda)
DATABASE_URL=postgresql://<user>:<password>@<neon-host>/neondb?sslmode=require
```

---

## 🚀 Instalasi & Menjalankan Aplikasi Secara Lokal

Ikuti langkah-langkah di bawah ini untuk memulai:

1. **Instal Dependensi**:
   ```bash
   npm install
   ```

2. **Jalankan Migrasi Database**:
   Menerapkan skema tabel relasional PostgreSQL ke database Neon cloud Anda:
   ```bash
   npm run db:migrate
   ```

3. **Populasikan Data Awal (Seeding)**:
   Mengisi database dengan akun admin default, 4 lantai, dan 10 ruang rapat dengan fasilitas lengkap:
   ```bash
   npm run db:seed
   ```
   *(Atau jalankan kombinasi perintah migrasi & seed sekaligus menggunakan `npm run db:all`)*

4. **Jalankan Development Server**:
   ```bash
   npm run dev
   ```
   Buka browser di alamat [http://localhost:3000](http://localhost:3000) untuk mengakses aplikasi.

5. **Uji Produksi Build**:
   ```bash
   npm run build
   ```

---

## 🔐 Kredensial Default Administrator (Seed)

Untuk masuk ke panel pengelolaan (Dashboard):
* **Email**: `admin@company.com`
* **Password**: `admin123`
* **Role**: `admin`

---

## 🚀 Panduan Deployment ke Vercel

Aplikasi ini dirancang *cloud-native* dan serverless-friendly sehingga dapat di-deploy ke Vercel secara mulus:

1. Buat proyek baru di **Vercel** dan hubungkan ke repositori GitHub proyek ini.
2. Tambahkan variabel lingkungan (`Environment Variables`) di setelan proyek Vercel Anda:
   * `DATABASE_URL` (sesuai koneksi string Neon)
   * `BETTER_AUTH_SECRET` (string acak panjang)
   * `BETTER_AUTH_URL` (URL domain Vercel Anda, contoh: `https://my-roombook.vercel.app`)
3. Jalankan build deployment. Vercel secara otomatis mendeteksi konfigurasi Turbopack Next.js dan melakukan kompilasi statis serta serverless functions.

### 2. Project Initialization

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
npx shadcn@latest add button sheet skeleton toast sonner card dialog input label select tabs badge separator dropdown-menu avatar sonner table -y
```

---
