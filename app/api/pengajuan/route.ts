import { NextRequest, NextResponse } from "next/server"
import { PengajuanStatus } from "@prisma/client"
import { z } from "zod"

import { prisma } from "@/lib/prisma"
import { ensureSeedData } from "@/lib/seed"
import { getUserFromRequest } from "@/lib/server-auth"
import { toClientPengajuan } from "@/lib/server-pengajuan"

const socialSchema = z
  .object({
    instagram: z.string().trim().max(200).optional(),
    facebook: z.string().trim().max(200).optional(),
    linkedin: z.string().trim().max(200).optional(),
    website: z.string().trim().max(200).optional(),
    tiktok: z.string().trim().max(200).optional(),
  })
  .partial()
  .optional()

const pengajuanSchema = z.object({
  namaUsaha: z.string().min(3, "Nama usaha minimal 3 karakter"),
  deskripsi: z.string().min(20, "Deskripsi minimal 20 karakter"),
  ownerProfile: z.string().min(30, "Profil pengelola minimal 30 karakter"),
  ownerSocials: socialSchema,
  jumlahPinjaman: z.number().int().min(100_000, "Jumlah pinjaman minimal Rp100.000"),
  jangkaWaktu: z.number().int().min(1, "Jangka waktu minimal 1 bulan"),
  tujuanPinjaman: z.string().min(3, "Tujuan pinjaman minimal 3 karakter"),
})

export async function GET(request: NextRequest) {
  await ensureSeedData()

  const user = await getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ message: "Belum login" }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const scope = searchParams.get("scope")
  const statusParam = searchParams.get("status")

  let where: any = {}

  if (scope === "mine") {
    where.userId = user.id
  } else if (statusParam) {
    const normalized = statusParam.toUpperCase() as keyof typeof PengajuanStatus
    if (PengajuanStatus[normalized]) {
      where.status = normalized
    }
  } else if (user.role === "INVESTOR") {
    where.status = { in: [PengajuanStatus.APPROVED, PengajuanStatus.FUNDED] }
  } else {
    where.userId = user.id
  }

  const pengajuan = await prisma.pengajuan.findMany({
    where,
    include: { investments: true, user: true },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json({ pengajuan: pengajuan.map((item) => toClientPengajuan(item)) })
}

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ message: "Belum login" }, { status: 401 })
  }

  if (user.role !== "PEMINJAM") {
    return NextResponse.json({ message: "Hanya peminjam yang dapat membuat pengajuan" }, { status: 403 })
  }

  try {
    const body = await request.json()
    const payload = pengajuanSchema.parse(body)
    const { ownerSocials, ...basePayload } = payload
    const cleanedSocialsEntries = Object.entries(ownerSocials || {}).reduce(
      (acc: [string, string][], [key, value]) => {
        if (value && value.trim().length > 0) {
          acc.push([key, value.trim()])
        }
        return acc
      },
      [],
    )
    const cleanedSocials = Object.fromEntries(cleanedSocialsEntries)

    const pengajuan = await prisma.pengajuan.create({
      data: {
        ...basePayload,
        ownerSocial: Object.keys(cleanedSocials).length ? cleanedSocials : undefined,
        userId: user.id,
        status: PengajuanStatus.APPROVED,
      },
      include: { investments: true, user: true },
    })

    return NextResponse.json({ pengajuan: toClientPengajuan(pengajuan) })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message || "Data tidak valid" }, { status: 400 })
    }

    return NextResponse.json({ message: "Gagal membuat pengajuan baru" }, { status: 500 })
  }
}
