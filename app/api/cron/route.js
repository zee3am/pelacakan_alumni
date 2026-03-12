import prisma from "@/lib/prisma";
import { extractPublicData } from "@/lib/extractor";
import { NextResponse } from "next/server";

// POST /api/cron - Run tracking for all untracked alumni
// Can also accept ?alumniId=X to track a specific alumni
export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const specificId = searchParams.get("alumniId");

    let alumniList;

    if (specificId) {
      // Track a specific alumni
      const alumni = await prisma.alumni.findUnique({
        where: { id: parseInt(specificId) },
      });
      if (!alumni) {
        return NextResponse.json(
          { error: "Alumni tidak ditemukan" },
          { status: 404 }
        );
      }
      alumniList = [alumni];
    } else {
      // Track all with status "Belum Dilacak" or "Perlu Verifikasi"
      alumniList = await prisma.alumni.findMany({
        where: {
          status: {
            in: ["Belum Dilacak", "Perlu Verifikasi"],
          },
        },
      });
    }

    const results = [];

    for (const alumni of alumniList) {
      try {
        // Extract public data from DuckDuckGo
        const evidences = await extractPublicData(alumni);

        // Save evidences to database
        for (const ev of evidences) {
          await prisma.trackingEvidence.create({
            data: {
              alumni_id: alumni.id,
              sumber: ev.sumber,
              url: ev.url,
              ringkasan_jabatan: ev.ringkasan_jabatan || "",
              confidence_score: ev.confidence_score,
              confidence_label: ev.confidence_label,
            },
          });
        }

        // Determine new status
        const hasStrongMatch = evidences.some(
          (e) => e.confidence_label === "Kemungkinan Kuat"
        );
        const hasAnyResult = evidences.length > 0;

        let newStatus;
        if (hasStrongMatch) {
          newStatus = "Perlu Verifikasi";
        } else if (hasAnyResult) {
          newStatus = "Perlu Verifikasi";
        } else {
          newStatus = "Belum Ditemukan";
        }

        await prisma.alumni.update({
          where: { id: alumni.id },
          data: {
            status: newStatus,
            last_tracked: new Date(),
          },
        });

        results.push({
          alumni_id: alumni.id,
          nama: alumni.nama,
          evidences_found: evidences.length,
          new_status: newStatus,
        });
      } catch (err) {
        console.error(`Error tracking alumni ${alumni.id}:`, err);
        results.push({
          alumni_id: alumni.id,
          nama: alumni.nama,
          error: err.message,
        });
      }
    }

    return NextResponse.json({
      message: `Pelacakan selesai untuk ${results.length} alumni`,
      results,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { error: "Gagal menjalankan pelacakan" },
      { status: 500 }
    );
  }
}
