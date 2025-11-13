import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { getUserFromRequest } from "@/lib/server-auth"
import { toClientPengajuan } from "@/lib/server-pengajuan"

const investmentSchema = z.object({
  pengajuanId: z.string().min(1, "ID pengajuan wajib diisi"),
  amount: z.number().int().min(100_000, "Minimal investasi Rp100.000"),
})

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request)

  if (!user) {
    return NextResponse.json({ message: "Belum login" }, { status: 401 })
  }

  if (user.role !== "INVESTOR") {
    return NextResponse.json({ message: "Hanya investor yang dapat melakukan investasi" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const payload = investmentSchema.parse(body)

    const pengajuan = await prisma.$transaction(async (tx) => {
      const current = await tx.pengajuan.findUnique({
        where: { id: payload.pengajuanId },
      })

      if (!current) {
        throw new Error("NOT_FOUND")
      }

      if (current.status === "PENDING" || current.status === "REJECTED") {
        throw new Error("NOT_OPEN")
      }

      const available = current.jumlahPinjaman - current.collectedAmount
      if (payload.amount > available) {
        throw new Error("AMOUNT_EXCEEDS")
      }

      await tx.investment.create({
        data: {
          investorId: user.id,
          pengajuanId: current.id,
          amount: payload.amount,
        },
      })

      const willBeCollected = current.collectedAmount + payload.amount
      const newStatus = willBeCollected >= current.jumlahPinjaman ? "FUNDED" : current.status

      return tx.pengajuan.update({
        where: { id: current.id },
        data: {
          collectedAmount: willBeCollected,
          status: newStatus,
        },
        include: { investments: true, user: true },
      })
    })

    return NextResponse.json({
      message: "Investasi berhasil dicatat",
      pengajuan: toClientPengajuan(pengajuan),
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message || "Data tidak valid" }, { status: 400 })
    }

    if (error instanceof Error) {
      if (error.message === "NOT_FOUND") {
        return NextResponse.json({ message: "Pengajuan tidak ditemukan" }, { status: 404 })
      }

      if (error.message === "NOT_OPEN") {
        return NextResponse.json({ message: "Pengajuan belum siap menerima investasi" }, { status: 400 })
      }

      if (error.message === "AMOUNT_EXCEEDS") {
        return NextResponse.json({ message: "Jumlah melebihi kebutuhan pendanaan" }, { status: 400 })
      }
    }

    return NextResponse.json({ message: "Gagal memproses investasi" }, { status: 500 })
  }
}
