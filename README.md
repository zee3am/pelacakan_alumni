# Alumni Tracker

Sistem otomatis untuk melacak informasi alumni menggunakan pencarian web dan ekstraksi data.

## Informasi Proyek

| Komponen | Deskripsi |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript / JavaScript |
| **Database** | Prisma ORM |
| **Searching** | DuckDuckGo Web Search |
| **Scraping** | Cheerio |

## Fitur Utama

| Fitur | Keterangan |
| :--- | :--- |
| **Dashboard Alumni** | Menampilkan daftar alumni dan status pelacakan terbaru. |
| **Pelacakan Otomatis** | Menggunakan pencarian web untuk menemukan profil LinkedIn atau berita terbaru. |
| **Ekstraksi Data** | Mengambil data relevan dari hasil pencarian secara otomatis. |
| **Cron Jobs** | Mendukung pembaruan data secara berkala (Batch Update). |

## Cara Penggunaan Lokal

Ikuti langkah-langkah berikut untuk menjalankan proyek ini di mesin lokal Anda:

### 1. Persiapan
Pastikan Anda sudah menginstal **Node.js** dan **npm**.

### 2. Instalasi Dependensi
```bash
npm install
```

### 3. Konfigurasi Database
Pastikan file `.env` sudah dikonfigurasi dengan URL database Anda, lalu jalankan:
```bash
npx prisma generate
npx prisma db push
```

### 4. Menjalankan Aplikasi
Jalankan server pengembangan:
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

### 5. API Endpoints (Opsional)
- `/api/alumni`: Untuk mengelola data alumni.
- `/api/cron`: Untuk memicu proses pelacakan secara manual.
