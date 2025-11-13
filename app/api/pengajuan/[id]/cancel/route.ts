import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/server-auth"
import { toClientPengajuan } from "@/lib/server-pengajuan"

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ message: "Belum login" }, { status: 401 })
  }

  const { id } = await context.params

  const pengajuan = await prisma.pengajuan.findUnique({
    where: { id },
    include: { investments: true, user: true },
  })

  if (!pengajuan) {
    return NextResponse.json({ message: "Pengajuan tidak ditemukan" }, { status: 404 })
  }

  const isOwner = pengajuan.userId === user.id
  const isInvestor = user.role === "INVESTOR"

  if (!isOwner && !isInvestor) {
    return NextResponse.json({ message: "Anda tidak berhak membatalkan pengajuan ini" }, { status: 403 })
  }

  if (pengajuan.investments.length > 0) {
    return NextResponse.json({ message: "Pengajuan dengan investor aktif tidak dapat dibatalkan" }, { status: 400 })
  }

  const updated = await prisma.pengajuan.update({
    where: { id },
    data: {
      status: "CANCELLED",
    },
    include: { investments: true, user: true },
  })

  return NextResponse.json({
    pengajuan: toClientPengajuan(updated),
  })
}
