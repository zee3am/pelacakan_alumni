import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/alumni/[id] - Get alumni detail with all evidences
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const alumni = await prisma.alumni.findUnique({
      where: { id: parseInt(id) },
      include: {
        evidences: {
          orderBy: { confidence_score: "desc" },
        },
      },
    });

    if (!alumni) {
      return NextResponse.json(
        { error: "Alumni tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(alumni);
  } catch (error) {
    console.error("Error fetching alumni detail:", error);
    return NextResponse.json(
      { error: "Gagal mengambil detail alumni" },
      { status: 500 }
    );
  }
}

// DELETE /api/alumni/[id] - Delete an alumni
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    await prisma.alumni.delete({
      where: { id: parseInt(id) },
    });
    return NextResponse.json({ message: "Alumni berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting alumni:", error);
    return NextResponse.json(
      { error: "Gagal menghapus alumni" },
      { status: 500 }
    );
  }
}

// PATCH /api/alumni/[id] - Update alumni status
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const alumni = await prisma.alumni.update({
      where: { id: parseInt(id) },
      data: body,
    });

    return NextResponse.json(alumni);
  } catch (error) {
    console.error("Error updating alumni:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui alumni" },
      { status: 500 }
    );
  }
}
