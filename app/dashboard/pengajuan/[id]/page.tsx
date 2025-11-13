"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser, type User } from "@/lib/auth"
import { cancelPengajuan, deletePengajuan, fetchPengajuanById, type Pengajuan } from "@/lib/pengajuan"
import { AlertCircle, ArrowLeft, CheckCircle, Link2, Trash2, UserRound } from "lucide-react"

export default function PengajuanDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [pengajuan, setPengajuan] = useState<Pengajuan | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionError, setActionError] = useState("")
  const [actionMessage, setActionMessage] = useState("")
  const [actionLoading, setActionLoading] = useState({ cancel: false, delete: false })

  useEffect(() => {
    const loadData = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        setLoading(false)
        router.push("/login")
        return
      }

      try {
        const pengajuanData = await fetchPengajuanById(params.id as string)
        setPengajuan(pengajuanData)
        setUser(currentUser)
      } catch (error) {
        router.push("/dashboard")
        return
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [router, params])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Memuat...</p>
      </div>
    )
  }

  if (!pengajuan) {
    return null
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Menunggu Persetujuan" },
      approved: { bg: "bg-blue-100", text: "text-blue-800", label: "Siap Didanai" },
      funded: { bg: "bg-green-100", text: "text-green-800", label: "Tuntas Didanai" },
      rejected: { bg: "bg-red-100", text: "text-red-800", label: "Ditolak" },
      cancelled: { bg: "bg-gray-100", text: "text-gray-800", label: "Dibatalkan" },
    }

    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${config.bg} ${config.text}`}>{config.label}</span>
    )
  }

  const socialLabelMap: Record<string, string> = {
    instagram: "Instagram",
    linkedin: "LinkedIn",
    facebook: "Facebook",
    website: "Website",
    tiktok: "TikTok",
  }

  const formatSocialLink = (value: string) => {
    if (!value) return "#"
    const trimmed = value.trim()
    if (/^https?:\/\//i.test(trimmed)) return trimmed
    if (trimmed.startsWith("@")) {
      return `https://instagram.com/${trimmed.slice(1)}`
    }
    return `https://${trimmed}`
  }

  const canManage = user?.type === "investor" || user?.id === pengajuan.userId
  const canCancel = canManage && ["pending", "approved"].includes(pengajuan.status)
  const canDelete = canManage && pengajuan.investorsCount === 0

  const handleCancel = async () => {
    if (!pengajuan) return
    if (!window.confirm("Batalkan pengajuan ini? Data akan ditandai dibatalkan.")) {
      return
    }
    setActionError("")
    setActionMessage("")
    setActionLoading((prev) => ({ ...prev, cancel: true }))
    try {
      const updated = await cancelPengajuan(pengajuan.id)
      setPengajuan(updated)
      setActionMessage("Pengajuan berhasil dibatalkan.")
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Gagal membatalkan pengajuan")
    } finally {
      setActionLoading((prev) => ({ ...prev, cancel: false }))
    }
  }

  const handleDelete = async () => {
    if (!pengajuan) return
    if (!window.confirm("Hapus permanen pengajuan ini? Tindakan tidak dapat dibatalkan.")) {
      return
    }
    setActionError("")
    setActionMessage("")
    setActionLoading((prev) => ({ ...prev, delete: true }))
    try {
      await deletePengajuan(pengajuan.id)
      router.push("/dashboard")
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Gagal menghapus pengajuan")
    } finally {
      setActionLoading((prev) => ({ ...prev, delete: false }))
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">ModaUMKM</h1>
            <p className="text-sm text-muted-foreground">Detail Pengajuan</p>
          </div>
          <Link href="/dashboard">
            <Button variant="outline" size="sm" className="gap-2 bg-transparent">
              <ArrowLeft className="w-4 h-4" />
              Kembali
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {actionError && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="w-4 h-4" />
            <span>{actionError}</span>
          </div>
        )}
        {actionMessage && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-700">
            <CheckCircle className="w-4 h-4" />
            <span>{actionMessage}</span>
          </div>
        )}

        {/* Status Card */}
        <Card className="border-border mb-8 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">{pengajuan.namaUsaha}</h2>
                <p className="text-muted-foreground">ID Pengajuan: {pengajuan.id}</p>
                <p className="text-sm text-muted-foreground mt-1">Pemilik: {pengajuan.ownerName}</p>
              </div>
              <div>{getStatusBadge(pengajuan.status)}</div>
            </div>
          </CardContent>
        </Card>

        {/* Owner Profile */}
        <Card className="border-border mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="w-4 h-4" />
              Profil Pengelola
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground leading-relaxed">{pengajuan.ownerProfile}</p>
            {Object.keys(pengajuan.ownerSocials || {}).length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {Object.entries(pengajuan.ownerSocials || {}).map(([key, value]) => (
                  <a
                    key={`${pengajuan.id}-${key}`}
                    href={formatSocialLink(value)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-primary/30 px-4 py-1 text-sm text-primary hover:bg-primary/10 transition"
                  >
                    <Link2 className="w-4 h-4" />
                    {socialLabelMap[key] || key}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Pengelola belum menambahkan tautan sosial.</p>
            )}
          </CardContent>
        </Card>

        {canManage && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end mb-8">
            {canCancel && (
              <Button variant="outline" onClick={handleCancel} disabled={actionLoading.cancel}>
                {actionLoading.cancel ? "Memproses..." : "Batalkan Pengajuan"}
              </Button>
            )}
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={actionLoading.delete || !canDelete}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {actionLoading.delete ? "Menghapus..." : "Hapus Pengajuan"}
            </Button>
            {!canDelete && (
              <p className="text-xs text-muted-foreground">
                Pengajuan tidak dapat dihapus karena sudah memiliki investor.
              </p>
            )}
          </div>
        )}

        {/* Details Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Informasi Pinjaman */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Informasi Pinjaman</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Jumlah Pinjaman</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(pengajuan.jumlahPinjaman)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Jangka Waktu</p>
                <p className="text-lg font-semibold text-foreground">{pengajuan.jangkaWaktu} bulan</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Tujuan Pinjaman</p>
                <p className="text-lg font-semibold text-foreground capitalize">{pengajuan.tujuanPinjaman}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Dana Terkumpul</p>
                <p className="text-lg font-semibold text-foreground">
                  {formatCurrency(pengajuan.collectedAmount)} / {formatCurrency(pengajuan.jumlahPinjaman)}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Dibuat</p>
                <p className="text-sm font-semibold text-foreground">{formatDate(pengajuan.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Terakhir Diupdate</p>
                <p className="text-sm font-semibold text-foreground">{formatDate(pengajuan.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Deskripsi */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle>Deskripsi Usaha</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">{pengajuan.deskripsi}</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
