-- CreateTable
CREATE TABLE "Alumni" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nama" TEXT NOT NULL,
    "afiliasi_kampus" TEXT,
    "program_studi" TEXT,
    "kota" TEXT,
    "bidang_pekerjaan" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Belum Dilacak',
    "last_tracked" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TrackingEvidence" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "alumni_id" INTEGER NOT NULL,
    "sumber" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "ringkasan_jabatan" TEXT,
    "confidence_score" REAL NOT NULL DEFAULT 0,
    "confidence_label" TEXT,
    "tanggal_ditemukan" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "TrackingEvidence_alumni_id_fkey" FOREIGN KEY ("alumni_id") REFERENCES "Alumni" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
