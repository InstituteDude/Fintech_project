import type { Investment, Pengajuan as PrismaPengajuan, PengajuanStatus, User } from "@prisma/client"

import type { PengajuanDto } from "@/types/pengajuan"

const statusMap: Record<PengajuanStatus, PengajuanDto["status"]> = {
  PENDING: "pending",
  APPROVED: "approved",
  FUNDED: "funded",
  REJECTED: "rejected",
  CANCELLED: "cancelled",
}

export function toClientPengajuan(
  pengajuan: PrismaPengajuan & { investments?: Investment[]; user?: User | null },
): PengajuanDto {
  return {
    id: pengajuan.id,
    userId: pengajuan.userId,
    ownerName: pengajuan.user?.name || "UMKM",
    ownerProfile: pengajuan.ownerProfile || "",
    namaUsaha: pengajuan.namaUsaha,
    deskripsi: pengajuan.deskripsi,
    jumlahPinjaman: pengajuan.jumlahPinjaman,
    jangkaWaktu: pengajuan.jangkaWaktu,
    tujuanPinjaman: pengajuan.tujuanPinjaman,
    status: statusMap[pengajuan.status],
    collectedAmount: pengajuan.collectedAmount,
    createdAt: pengajuan.createdAt.toISOString(),
    updatedAt: pengajuan.updatedAt.toISOString(),
    investorsCount: pengajuan.investments?.length || 0,
    ownerSocials: ((pengajuan.ownerSocial ?? {}) as Record<string, string>),
  }
}
