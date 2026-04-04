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
    let csvData = "ID,Nama,Status,Instansi Kampus,Program Studi,Kota,Bidang Pekerjaan,Ditemukan Di,Link Bukti,Ringkasan,Skor Kecocokan,Terakhir Dilacak\n";

    alumniList.forEach(alumni => {
      const evidence = alumni.evidences[0];
      
      const cols = [
        alumni.id,
        `"${(alumni.nama || '').replace(/"/g, '""')}"`,
        alumni.status,
        `"${(alumni.afiliasi_kampus || '').replace(/"/g, '""')}"`,
        `"${(alumni.program_studi || '').replace(/"/g, '""')}"`,
        `"${(alumni.kota || '').replace(/"/g, '""')}"`,
        `"${(alumni.bidang_pekerjaan || '').replace(/"/g, '""')}"`,
        `"${evidence ? (evidence.sumber || '').replace(/"/g, '""') : '—'}"`,
        `"${evidence ? evidence.url : '—'}"`,
        `"${evidence ? (evidence.ringkasan_jabatan || '').replace(/"/g, '""') : '—'}"`,
        evidence ? `${evidence.confidence_score}%` : '—',
        alumni.last_tracked ? new Date(alumni.last_tracked).toISOString().split('T')[0] : '—'
      ];
      
      csvData += cols.join(",") + "\n";
    });

    return new NextResponse(csvData, {
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
