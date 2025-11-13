"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { getCurrentUser, logoutUser, type User } from "@/lib/auth"
import {
  cancelPengajuan,
  fetchMarketplacePengajuan,
  fetchUserPengajuan,
  getPengajuanStats,
  investInPengajuan,
  type Pengajuan,
} from "@/lib/pengajuan"
import {
  AlertCircle,
  Ban,
  CheckCircle,
  Clock,
  Link2,
  LogOut,
  PiggyBank,
  Plus,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react"

const initialStats = {
  total: 0,
  pending: 0,
  approved: 0,
  funded: 0,
  rejected: 0,
  cancelled: 0,
  totalAmount: 0,
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
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
  }
  if (trimmed.startsWith("@")) {
    return `https://instagram.com/${trimmed.slice(1)}`
  }
  return `https://${trimmed}`
}

const truncate = (text: string, length = 140) => {
  if (!text) return ""
  return text.length > length ? `${text.slice(0, length)}…` : text
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [pengajuanList, setPengajuanList] = useState<Pengajuan[]>([])
  const [stats, setStats] = useState(initialStats)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [feedback, setFeedback] = useState<string | null>(null)
  const [investAmounts, setInvestAmounts] = useState<Record<string, string>>({})
  const [investingId, setInvestingId] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const isPeminjam = user?.type === "peminjam"

  const investorSummary = useMemo(() => {
    const funded = pengajuanList.filter((item) => item.status === "funded").length
    const remaining = pengajuanList.reduce((sum, item) => sum + Math.max(item.jumlahPinjaman - item.collectedAmount, 0), 0)
    return {
      total: pengajuanList.length,
      funded,
      remaining,
    }
  }, [pengajuanList])

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
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>{config.label}</span>
    )
  }

  const loadPengajuan = async (role: User["type"]) => {
    setError("")
    if (role === "peminjam") {
      const list = await fetchUserPengajuan()
      setPengajuanList(list)
      setStats(getPengajuanStats(list))
    } else {
      const list = await fetchMarketplacePengajuan()
      setPengajuanList(list)
    }
  }

  useEffect(() => {
    let cancelled = false

    const bootstrap = async () => {
      try {
        const currentUser = await getCurrentUser()
        if (!currentUser) {
          router.push("/login")
          return
        }

        if (cancelled) return

        setUser(currentUser)
        await loadPengajuan(currentUser.type)
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Gagal memuat data")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    bootstrap()

    return () => {
      cancelled = true
    }
  }, [router])

  const handleLogout = async () => {
    await logoutUser()
    router.push("/")
  }

  const handleInvest = async (pengajuanId: string) => {
    if (!user) return
    setError("")
    setFeedback(null)

    const amountValue = Number(investAmounts[pengajuanId])
    if (!amountValue || amountValue < 100000) {
      setError("Minimal investasi Rp100.000")
      return
    }

    setInvestingId(pengajuanId)
    try {
      const { pengajuan } = await investInPengajuan(pengajuanId, amountValue)
      setFeedback(`Investasi untuk ${pengajuan.namaUsaha} berhasil dicatat`)
      setInvestAmounts((prev) => ({ ...prev, [pengajuanId]: "" }))
      await loadPengajuan(user.type)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memproses investasi")
    } finally {
      setInvestingId(null)
    }
  }

  const handleCancelPengajuan = async (pengajuanId: string) => {
    if (!user) {
      return
    }
    setError("")
    setFeedback(null)
    setCancellingId(pengajuanId)

    try {
      await cancelPengajuan(pengajuanId)
      setFeedback("Pengajuan berhasil dibatalkan")
      await loadPengajuan(user.type)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membatalkan pengajuan")
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Memuat...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">Gotong Royong & Invest</h1>
            <p className="text-sm text-muted-foreground">Dashboard</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-medium text-foreground">{user.name}</p>
              <p className="text-xs text-muted-foreground capitalize">
                {isPeminjam ? "Peminjam" : "Investor"}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2 bg-transparent">
              <LogOut className="w-4 h-4" />
              Keluar
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Selamat datang, {user.name}!</h2>
            <p className="text-muted-foreground">
              {isPeminjam ? "Kelola pengajuan pembiayaan UMKM Anda." : "Temukan UMKM potensial untuk didanai."}
            </p>
          </div>
          {isPeminjam && (
            <Link href="/dashboard/pengajuan-baru">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Pengajuan Baru
              </Button>
            </Link>
          )}
        </div>

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        {feedback && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-700">
            <CheckCircle className="w-4 h-4" />
            <span>{feedback}</span>
          </div>
        )}

        {isPeminjam ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Pengajuan</CardTitle>
                <TrendingUp className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-3xl font-bold text-foreground">{stats.total}</div>
                <CardDescription>Total semua pengajuan</CardDescription>
                <p className="text-xs text-muted-foreground">
                  Nilai pengajuan: {formatCurrency(stats.totalAmount)}
                </p>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Menunggu</CardTitle>
                <Clock className="w-4 h-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stats.pending}</div>
                <CardDescription>Butuh review tim</CardDescription>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Disetujui</CardTitle>
                <CheckCircle className="w-4 h-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stats.approved}</div>
                <CardDescription>Siap ditawarkan</CardDescription>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Didanai</CardTitle>
                <PiggyBank className="w-4 h-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stats.funded}</div>
                <CardDescription>Tuntas didanai investor</CardDescription>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Ditolak</CardTitle>
                <XCircle className="w-4 h-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stats.rejected}</div>
                <CardDescription>Butuh revisi</CardDescription>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Dibatalkan</CardTitle>
                <Ban className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{stats.cancelled}</div>
                <CardDescription>Ditarik oleh Anda</CardDescription>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Peluang</CardTitle>
                <TrendingUp className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{investorSummary.total}</div>
                <CardDescription>UMKM terbuka untuk investasi</CardDescription>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">UMKM Didanai</CardTitle>
                <Users className="w-4 h-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">{investorSummary.funded}</div>
                <CardDescription>Sudah penuh pendanaan</CardDescription>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Kebutuhan</CardTitle>
                <PiggyBank className="w-4 h-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{formatCurrency(investorSummary.remaining)}</div>
                <CardDescription>Sisa dana yang dibutuhkan</CardDescription>
              </CardContent>
            </Card>
          </div>
        )}

        {isPeminjam ? (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-foreground">Pengajuan Anda</h3>
                <p className="text-muted-foreground text-sm">Pantau status dan progres pengajuan pendanaan.</p>
              </div>
            </div>

            {pengajuanList.length === 0 ? (
              <Card className="border-dashed border-border">
                <CardContent className="py-10 text-center">
                  <p className="text-muted-foreground">
                    Belum ada pengajuan. Klik tombol &quot;Pengajuan Baru&quot; untuk memulai.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {pengajuanList.map((item) => (
                  <Card key={item.id} className="border-border">
                    <CardHeader className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <CardTitle className="text-xl text-foreground">{item.namaUsaha}</CardTitle>
                        <CardDescription>Dibuat pada {formatDate(item.createdAt)}</CardDescription>
                      </div>
                      {getStatusBadge(item.status)}
                    </CardHeader>
                    <CardContent className="grid gap-6 md:grid-cols-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Jumlah Pinjaman</p>
                        <p className="text-lg font-semibold text-foreground">{formatCurrency(item.jumlahPinjaman)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Dana Terkumpul</p>
                        <p className="text-lg font-semibold text-foreground">
                          {formatCurrency(item.collectedAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Jangka Waktu</p>
                        <p className="text-lg font-semibold text-foreground">{item.jangkaWaktu} bulan</p>
                      </div>
                      <div className="flex flex-col items-start gap-2 md:items-end">
                        <p className="text-sm text-muted-foreground">{item.investorsCount} investor</p>
                        <div className="flex flex-col gap-2 md:flex-row">
                          {["pending", "approved"].includes(item.status) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelPengajuan(item.id)}
                              disabled={cancellingId === item.id}
                            >
                              {cancellingId === item.id ? "Memproses..." : "Batalkan"}
                            </Button>
                          )}
                          <Link href={`/dashboard/pengajuan/${item.id}`}>
                            <Button variant="outline" size="sm">
                              Lihat Detail
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        ) : (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-foreground">Peluang Investasi</h3>
                <p className="text-muted-foreground text-sm">
                  Danai berbagai UMKM dan pantau progres pendanaan secara real-time.
                </p>
              </div>
            </div>
            {pengajuanList.length === 0 ? (
              <Card className="border-dashed border-border">
                <CardContent className="py-10 text-center">
                  <p className="text-muted-foreground">Belum ada peluang tersedia saat ini.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {pengajuanList.map((item) => {
                  const available = Math.max(item.jumlahPinjaman - item.collectedAmount, 0)
                  const progressValue = Math.min(100, Math.round((item.collectedAmount / item.jumlahPinjaman) * 100))

                  return (
                    <Card key={item.id} className="border-border flex flex-col justify-between">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <CardTitle className="text-xl text-foreground">{item.namaUsaha}</CardTitle>
                            <CardDescription>oleh {item.ownerName}</CardDescription>
                          </div>
                          {getStatusBadge(item.status)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Target Pendanaan</p>
                          <p className="text-lg font-semibold text-foreground">{formatCurrency(item.jumlahPinjaman)}</p>
                        </div>
                        <div>
                          <Progress value={progressValue} className="h-2" />
                          <div className="flex justify-between text-xs text-muted-foreground mt-2">
                            <span>{formatCurrency(item.collectedAmount)} terkumpul</span>
                            <span>{progressValue}%</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{item.deskripsi}</p>
                        <div className="rounded-lg bg-muted/40 p-3">
                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                            Profil Pengelola
                          </p>
                          <p className="text-sm text-foreground mt-1">{truncate(item.ownerProfile)}</p>
                          {Object.keys(item.ownerSocials || {}).length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {Object.entries(item.ownerSocials || {}).map(([key, value]) => (
                                <a
                                  key={`${item.id}-${key}`}
                                  href={formatSocialLink(value)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 rounded-full border border-primary/30 px-3 py-1 text-xs text-primary hover:bg-primary/10 transition"
                                >
                                  <Link2 className="w-3 h-3" />
                                  {socialLabelMap[key] || key}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground flex items-center justify-between">
                          <span>{item.investorsCount} investor bergabung</span>
                          <span>Sisa: {formatCurrency(available)}</span>
                        </div>
                        <form
                          className="flex flex-col gap-3"
                          onSubmit={(e) => {
                            e.preventDefault()
                            handleInvest(item.id)
                          }}
                        >
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rp</span>
                            <input
                              type="number"
                              min={100000}
                              step="any"
                              value={investAmounts[item.id] || ""}
                              onChange={(e) =>
                                setInvestAmounts((prev) => ({
                                  ...prev,
                                  [item.id]: e.target.value,
                                }))
                              }
                              className="w-full rounded-lg border border-input bg-background px-12 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                              placeholder="Nominal investasi"
                            />
                          </div>
                          <div className="flex gap-3">
                            <Button type="submit" className="flex-1" disabled={investingId === item.id}>
                              {investingId === item.id ? "Memproses..." : "Investasi Sekarang"}
                            </Button>
                            <Link href={`/dashboard/pengajuan/${item.id}`}>
                              <Button variant="outline" type="button">
                                Detail
                              </Button>
                            </Link>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  )
}
