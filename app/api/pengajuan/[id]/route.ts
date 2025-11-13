import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { ensureSeedData } from "@/lib/seed"
import { getUserFromRequest } from "@/lib/server-auth"
import { toClientPengajuan } from "@/lib/server-pengajuan"

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  await ensureSeedData()

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

  return NextResponse.json({ pengajuan: toClientPengajuan(pengajuan) })
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const user = await getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ message: "Belum login" }, { status: 401 })
  }

  const { id } = await context.params

  const pengajuan = await prisma.pengajuan.findUnique({
    where: { id },
    include: { investments: true },
  })

  if (!pengajuan) {
    return NextResponse.json({ message: "Pengajuan tidak ditemukan" }, { status: 404 })
  }

  const isOwner = pengajuan.userId === user.id
  const isInvestor = user.role === "INVESTOR"

  if (!isOwner && !isInvestor) {
    return NextResponse.json({ message: "Anda tidak berhak menghapus pengajuan ini" }, { status: 403 })
  }

  if (pengajuan.investments.length > 0) {
    return NextResponse.json({ message: "Pengajuan yang sudah memiliki investor tidak dapat dihapus" }, { status: 400 })
  }

  await prisma.pengajuan.delete({
    where: { id },
  })

  return NextResponse.json({ success: true })
}
