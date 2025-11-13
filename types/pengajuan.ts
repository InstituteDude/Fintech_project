export type PengajuanStatus = "pending" | "approved" | "funded" | "rejected" | "cancelled"

export interface PengajuanDto {
  id: string
  userId: string
  ownerName: string
  ownerProfile: string
  namaUsaha: string
  deskripsi: string
  jumlahPinjaman: number
  jangkaWaktu: number
  tujuanPinjaman: string
  status: PengajuanStatus
  collectedAmount: number
  createdAt: string
  updatedAt: string
  investorsCount: number
  ownerSocials: Record<string, string>
}
