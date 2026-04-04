import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/alumni - List all alumni
export async function GET() {
  try {
    const alumni = await prisma.alumni.findMany({
      orderBy: { updated_at: "desc" },
      include: {
        evidences: {
          orderBy: { confidence_score: "desc" },
          take: 1,
        },
      },
    });
    return NextResponse.json(alumni);
  } catch (error) {
    console.error("Error fetching alumni:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data alumni" },
      { status: 500 }
    );
  }
}

// POST /api/alumni - Create new alumni
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      nama,
      afiliasi_kampus,
      program_studi,
      kota,
      bidang_pekerjaan,
      linkedin,
      instagram,
      facebook,
      tiktok,
      email,
      no_hp,
      tempat_bekerja,
      alamat_bekerja,
      posisi,
      status_kepegawaian,
      medsos_tempat_bekerja
    } = body;

    if (!nama || nama.trim() === "") {
      return NextResponse.json(
        { error: "Nama alumni wajib diisi" },
        { status: 400 }
      );
    }

    const alumni = await prisma.alumni.create({
      data: {
        nama: nama.trim(),
        afiliasi_kampus: afiliasi_kampus?.trim() || null,
        program_studi: program_studi?.trim() || null,
        kota: kota?.trim() || null,
        bidang_pekerjaan: bidang_pekerjaan?.trim() || null,
        linkedin: linkedin?.trim() || null,
        instagram: instagram?.trim() || null,
        facebook: facebook?.trim() || null,
        tiktok: tiktok?.trim() || null,
        email: email?.trim() || null,
        no_hp: no_hp?.trim() || null,
        tempat_bekerja: tempat_bekerja?.trim() || null,
        alamat_bekerja: alamat_bekerja?.trim() || null,
        posisi: posisi?.trim() || null,
        status_kepegawaian: status_kepegawaian?.trim() || null,
        medsos_tempat_bekerja: medsos_tempat_bekerja?.trim() || null
      },
    });

    return NextResponse.json(alumni, { status: 201 });
  } catch (error) {
    console.error("Error creating alumni:", error);
    return NextResponse.json(
      { error: "Gagal membuat data alumni" },
      { status: 500 }
    );
  }
}
