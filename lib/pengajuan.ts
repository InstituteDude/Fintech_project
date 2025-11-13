import { apiFetch } from "@/lib/api-client"
import type { PengajuanDto } from "@/types/pengajuan"

export type Pengajuan = PengajuanDto

interface PengajuanListResponse {
  pengajuan: Pengajuan[]
}

interface PengajuanResponse {
  pengajuan: Pengajuan
}

export async function fetchUserPengajuan(): Promise<Pengajuan[]> {
  const data = await apiFetch<PengajuanListResponse>("/api/pengajuan?scope=mine")
  return data.pengajuan
}

export async function fetchMarketplacePengajuan(): Promise<Pengajuan[]> {
  const data = await apiFetch<PengajuanListResponse>("/api/pengajuan")
  return data.pengajuan
}

export async function fetchPengajuanById(id: string): Promise<Pengajuan> {
  const data = await apiFetch<PengajuanResponse>(`/api/pengajuan/${id}`)
  return data.pengajuan
}

interface CreatePengajuanPayload {
  namaUsaha: string
  deskripsi: string
  ownerProfile: string
  ownerSocials?: Record<string, string>
  jumlahPinjaman: number
  jangkaWaktu: number
  tujuanPinjaman: string
}

export async function createPengajuan(payload: CreatePengajuanPayload): Promise<Pengajuan> {
  const data = await apiFetch<PengajuanResponse>("/api/pengajuan", {
    method: "POST",
    body: JSON.stringify(payload),
  })

  return data.pengajuan
}

export async function investInPengajuan(pengajuanId: string, amount: number) {
  return apiFetch<{ message: string; pengajuan: Pengajuan }>("/api/investments", {
    method: "POST",
    body: JSON.stringify({ pengajuanId, amount }),
  })
}

export async function cancelPengajuan(id: string) {
  const data = await apiFetch<PengajuanResponse>(`/api/pengajuan/${id}/cancel`, {
    method: "PATCH",
  })

  return data.pengajuan
}

export async function deletePengajuan(id: string) {
  return apiFetch<{ success: boolean; message?: string }>(`/api/pengajuan/${id}`, {
    method: "DELETE",
  })
}

export function getPengajuanStats(list: Pengajuan[]) {
  return {
    total: list.length,
    pending: list.filter((p) => p.status === "pending").length,
    approved: list.filter((p) => p.status === "approved").length,
    funded: list.filter((p) => p.status === "funded").length,
    rejected: list.filter((p) => p.status === "rejected").length,
    cancelled: list.filter((p) => p.status === "cancelled").length,
    totalAmount: list.reduce((sum, item) => sum + item.jumlahPinjaman, 0),
  }
}
