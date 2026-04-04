import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { url, sumber, ringkasan_jabatan } = body;

    if (!url) {
      return NextResponse.json({ error: "URL wajib diisi" }, { status: 400 });
    }

    const evidence = await prisma.trackingEvidence.create({
      data: {
        alumni_id: parseInt(id),
        sumber: sumber || "Data Manual",
        url: url,
        ringkasan_jabatan: ringkasan_jabatan || "Ditambahkan secara manual",
        confidence_score: 100, // Data manual berarti 100% yakin
        confidence_label: "Kemungkinan Kuat",
        is_verified: true, // Otomatis terverifikasi karena diinput admin
      },
    });

    // Update status alumni menjadi Teridentifikasi
    await prisma.alumni.update({
      where: { id: parseInt(id) },
      data: { status: "Teridentifikasi" },
    });

    return NextResponse.json(evidence, { status: 201 });
  } catch (error) {
    console.error("Gagal menambah evidence manual:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan data" },
      { status: 500 }
    );
  }
}
