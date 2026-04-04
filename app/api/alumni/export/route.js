import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const alumniList = await prisma.alumni.findMany({
      include: {
        evidences: {
          orderBy: { confidence_score: 'desc' },
          take: 1
        }
      },
      orderBy: { created_at: 'desc' }
    });

    // Buat header CSV
    let csvData = "ID,Nama,Status,Instansi Kampus,Program Studi,Kota,Bidang Pekerjaan,Email,No HP,LinkedIn,Instagram,Facebook,TikTok,Tempat Bekerja,Alamat Bekerja,Posisi,Status Kepegawaian,Medsos Tempat Bekerja,Ditemukan Di (Scraper),Link Bukti (Scraper),Ringkasan (Scraper),Skor Kecocokan,Terakhir Dilacak\n";

    alumniList.forEach(alumni => {
      const evidence = alumni.evidences[0];
      
      const escapeCsv = (str) => {
        if (str === null || str === undefined) return '""';
        return `"${String(str).replace(/"/g, '""')}"`;
      };
      
      const cols = [
        alumni.id,
        escapeCsv(alumni.nama),
        escapeCsv(alumni.status),
        escapeCsv(alumni.afiliasi_kampus),
        escapeCsv(alumni.program_studi),
        escapeCsv(alumni.kota),
        escapeCsv(alumni.bidang_pekerjaan),
        escapeCsv(alumni.email),
        escapeCsv(alumni.no_hp),
        escapeCsv(alumni.linkedin),
        escapeCsv(alumni.instagram),
        escapeCsv(alumni.facebook),
        escapeCsv(alumni.tiktok),
        escapeCsv(alumni.tempat_bekerja),
        escapeCsv(alumni.alamat_bekerja),
        escapeCsv(alumni.posisi),
        escapeCsv(alumni.status_kepegawaian),
        escapeCsv(alumni.medsos_tempat_bekerja),
        escapeCsv(evidence ? evidence.sumber : ''),
        escapeCsv(evidence ? evidence.url : ''),
        escapeCsv(evidence ? evidence.ringkasan_jabatan : ''),
        evidence ? `${evidence.confidence_score}%` : '""',
        alumni.last_tracked ? new Date(alumni.last_tracked).toISOString().split('T')[0] : '""'
      ];
      
      csvData += cols.join(",") + "\n";
    });

    return new NextResponse("\uFEFF" + csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="data_alumni_${new Date().toISOString().split('T')[0]}.csv"`
      }
    });

  } catch (error) {
    console.error("Failed to export CSV:", error);
    return NextResponse.json({ error: "Gagal mengekspor data" }, { status: 500 });
  }
}
