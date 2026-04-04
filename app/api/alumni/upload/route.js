import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const json = body.data;

    if (!json || !Array.isArray(json) || json.length === 0) {
      return NextResponse.json({ error: "Data Excel kosong atau tidak valid" }, { status: 400 });
    }

    // Mapping key dari excel ke database (huruf kecil semua, hilangkan spasi dll)
    const mapKey = (header) => {
      const h = header.toLowerCase().trim();
      if (h.includes("nama")) return "nama";
      if (h.includes("kampus") || h.includes("universitas")) return "afiliasi_kampus";
      if (h.includes("prodi") || h.includes("program studi")) return "program_studi";
      if (h.includes("kota") || h.includes("domisili")) return "kota";
      if (h.includes("bidang")) return "bidang_pekerjaan";
      if (h.includes("email")) return "email";
      if (h.includes("hp") || h.includes("whatsapp")) return "no_hp";
      if (h.includes("linkedin")) return "linkedin";
      if (h.includes("instagram") || h.includes("ig")) return "instagram";
      if (h.includes("facebook") || h.includes("fb")) return "facebook";
      if (h.includes("tiktok")) return "tiktok";
      if (h.includes("tempat kerja") || h.includes("tempat bekerja") || h.includes("perusahaan") || h.includes("instansi")) return "tempat_bekerja";
      if (h.includes("alamat kerja") || h.includes("alamat perusahaan") || h.includes("alamat instansi")) return "alamat_bekerja";
      if (h.includes("posisi") || h.includes("jabatan")) return "posisi";
      if (h.includes("pns") || h.includes("jenis pekerjaan") || h.includes("swasta")) return "jenis_pekerjaan";
      if (h.includes("sosmed instansi") || h.includes("media sosial instansi") || h.includes("sosmed tempat")) return "sosmed_instansi";
      return null;
    };

    let validData = [];

    for (const row of json) {
      const mappedData = {};
      for (const [key, value] of Object.entries(row)) {
        const dbKey = mapKey(key);
        if (dbKey && value) {
          mappedData[dbKey] = String(value);
        }
      }

      if (mappedData.nama && mappedData.nama.trim() !== "") {
        validData.push({
          nama: mappedData.nama,
          afiliasi_kampus: mappedData.afiliasi_kampus || null,
          program_studi: mappedData.program_studi || null,
          kota: mappedData.kota || null,
          bidang_pekerjaan: mappedData.bidang_pekerjaan || null,
          email: mappedData.email || null,
          no_hp: mappedData.no_hp || null,
          linkedin: mappedData.linkedin || null,
          instagram: mappedData.instagram || null,
          facebook: mappedData.facebook || null,
          tiktok: mappedData.tiktok || null,
          tempat_bekerja: mappedData.tempat_bekerja || null,
          alamat_bekerja: mappedData.alamat_bekerja || null,
          posisi: mappedData.posisi || null,
          jenis_pekerjaan: mappedData.jenis_pekerjaan || null,
          sosmed_instansi: mappedData.sosmed_instansi || null,
          status: "Belum Dilacak" // Default status
        });
      }
    }

    if (validData.length > 0) {
      await prisma.alumni.createMany({
        data: validData,
        skipDuplicates: true // Optional, tapi tidak ada unique constraint sehingga akan lanjut saja
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Berhasil menyiapkan ${validData.length} data alumni dari file Excel.` 
    });

  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Gagal memproses/menyimpan data dari file" }, { status: 500 });
  }
}
