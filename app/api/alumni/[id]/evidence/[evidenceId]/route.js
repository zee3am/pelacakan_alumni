import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// PATCH /api/alumni/[id]/evidence/[evidenceId] - Verify an evidence
export async function PATCH(request, { params }) {
  try {
    const { id, evidenceId } = await params;

    const evidence = await prisma.trackingEvidence.update({
      where: { 
        id: parseInt(evidenceId),
        alumni_id: parseInt(id),
      },
      data: { is_verified: true },
    });

    // Update alumni status to "Teridentifikasi"
    await prisma.alumni.update({
      where: { id: parseInt(id) },
      data: { status: "Teridentifikasi" },
    });

    return NextResponse.json(evidence);
  } catch (error) {
    console.error("Error verifying evidence:", error);
    return NextResponse.json(
      { error: "Gagal memverifikasi evidence" },
      { status: 500 }
    );
  }
}
