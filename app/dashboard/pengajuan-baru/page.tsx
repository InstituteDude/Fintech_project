"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser, type User } from "@/lib/auth"
import { createPengajuan } from "@/lib/pengajuan"
import { AlertCircle, ArrowLeft, CheckCircle } from "lucide-react"

const socialFieldConfigs = [
  { name: "instagram", label: "Instagram / Threads", placeholder: "https://instagram.com/usaha" },
  { name: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/in/pengelola" },
  { name: "facebook", label: "Facebook Page", placeholder: "https://facebook.com/usaha" },
  { name: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@usaha" },
  { name: "website", label: "Website / Marketplace", placeholder: "https://usaha.com" },
] as const

export default function PengajuanBaruPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    namaUsaha: "",
    deskripsi: "",
    ownerProfile: "",
    jumlahPinjaman: "",
    jangkaWaktu: "",
    tujuanPinjaman: "",
    ownerSocials: {
      instagram: "",
      linkedin: "",
      facebook: "",
      website: "",
      tiktok: "",
    },
  })

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        setLoading(false)
        router.push("/login")
        return
      }

      if (currentUser.type !== "peminjam") {
        setLoading(false)
        router.push("/dashboard")
        return
      }

      setUser(currentUser)
      setLoading(false)
    }

    fetchUser()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => {
      const key = name as keyof typeof prev.ownerSocials
      return {
        ...prev,
        ownerSocials: {
          ...prev.ownerSocials,
          [key]: value,
        },
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      if (!formData.namaUsaha.trim()) {
        throw new Error("Nama usaha harus diisi")
      }

      if (!formData.deskripsi.trim()) {
        throw new Error("Deskripsi usaha harus diisi")
      }

      if (!formData.jumlahPinjaman || Number(formData.jumlahPinjaman) <= 0) {
        throw new Error("Jumlah pinjaman harus lebih dari 0")
      }

      if (!formData.jangkaWaktu || Number(formData.jangkaWaktu) <= 0) {
        throw new Error("Jangka waktu harus lebih dari 0 bulan")
      }

      if (!formData.tujuanPinjaman.trim()) {
        throw new Error("Tujuan pinjaman harus diisi")
      }

      if (!formData.ownerProfile.trim() || formData.ownerProfile.trim().length < 30) {
        throw new Error("Profil pengelola minimal 30 karakter")
      }

      await createPengajuan({
        namaUsaha: formData.namaUsaha,
        deskripsi: formData.deskripsi,
        ownerProfile: formData.ownerProfile,
        ownerSocials: formData.ownerSocials,
        jumlahPinjaman: Number(formData.jumlahPinjaman),
        jangkaWaktu: Number(formData.jangkaWaktu),
        tujuanPinjaman: formData.tujuanPinjaman,
      })

      setSuccess(true)
      setTimeout(() => {
        router.push("/dashboard")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setSubmitting(false)
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

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="border-border max-w-md w-full">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Pengajuan Berhasil!</h2>
            <p className="text-muted-foreground mb-6">
              Pengajuan pinjaman Anda telah berhasil dibuat. Anda akan diarahkan ke dashboard dalam beberapa detik.
            </p>
            <Link href="/dashboard">
              <Button className="w-full">Kembali ke Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatCurrency = (value: string) => {
    if (!value) return ""
    return new Intl.NumberFormat("id-ID").format(Number(value))
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-primary">ModaUMKM</h1>
            <p className="text-sm text-muted-foreground">Pengajuan Pinjaman Baru</p>
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
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Buat Pengajuan Pinjaman Baru</h2>
          <p className="text-muted-foreground">Isi form di bawah dengan detail usaha dan kebutuhan pendanaan Anda</p>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>Informasi Pengajuan</CardTitle>
            <CardDescription>Pastikan semua informasi yang Anda berikan akurat dan lengkap</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Nama Usaha */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Nama Usaha</label>
                <input
                  type="text"
                  name="namaUsaha"
                  value={formData.namaUsaha}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Contoh: Toko Kue Ibu Siti"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">Nama bisnis atau usaha Anda</p>
              </div>

              {/* Deskripsi Usaha */}
              <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Deskripsi Usaha</label>
              <textarea
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                rows={4}
                placeholder="Jelaskan tentang usaha Anda, produk/layanan yang ditawarkan, dan pengalaman Anda..."
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Minimal 20 karakter</p>
            </div>

            {/* Profil Pengelola */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Profil Pengelola</label>
              <textarea
                name="ownerProfile"
                value={formData.ownerProfile}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                rows={4}
                placeholder="Ceritakan pengalaman, kompetensi, dan rekam jejak Anda mengelola usaha ini..."
                required
              />
              <p className="text-xs text-muted-foreground mt-1">Minimal 30 karakter, ditampilkan kepada investor.</p>
            </div>

            {/* Social Links */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Tautan Sosial Pengelola</label>
              <div className="grid gap-4 md:grid-cols-2">
                {socialFieldConfigs.map((field) => (
                  <div key={field.name}>
                    <label className="block text-xs font-semibold text-muted-foreground mb-1">{field.label}</label>
                    <input
                      type="text"
                      name={field.name}
                      value={formData.ownerSocials[field.name as keyof typeof formData.ownerSocials]}
                      onChange={handleSocialChange}
                      className="w-full px-4 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      placeholder={field.placeholder}
                    />
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Opsional, tetapi sangat membantu investor mengenal pengelola usaha Anda.
              </p>
            </div>

              {/* Jumlah Pinjaman */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Jumlah Pinjaman (Rp)</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-muted-foreground">Rp</span>
                  <input
                    type="number"
                    name="jumlahPinjaman"
                    value={formData.jumlahPinjaman}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="0"
                    min="0"
                    required
                  />
                </div>
                {formData.jumlahPinjaman && (
                  <p className="text-xs text-muted-foreground mt-1">{formatCurrency(formData.jumlahPinjaman)}</p>
                )}
              </div>

              {/* Jangka Waktu */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Jangka Waktu (Bulan)</label>
                  <select
                    name="jangkaWaktu"
                    value={formData.jangkaWaktu}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Pilih jangka waktu</option>
                    <option value="3">3 bulan</option>
                    <option value="6">6 bulan</option>
                    <option value="12">12 bulan</option>
                    <option value="24">24 bulan</option>
                    <option value="36">36 bulan</option>
                  </select>
                </div>

                {/* Tujuan Pinjaman */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Tujuan Pinjaman</label>
                  <select
                    name="tujuanPinjaman"
                    value={formData.tujuanPinjaman}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="">Pilih tujuan pinjaman</option>
                    <option value="modal-kerja">Modal Kerja</option>
                    <option value="pembelian-aset">Pembelian Aset</option>
                    <option value="ekspansi">Ekspansi Usaha</option>
                    <option value="renovasi">Renovasi/Perbaikan</option>
                    <option value="pembelian-stok">Pembelian Stok</option>
                    <option value="lainnya">Lainnya</option>
                  </select>
                </div>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <h4 className="font-semibold text-foreground mb-2">Informasi Penting</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Pastikan semua data yang Anda masukkan akurat dan dapat diverifikasi</li>
                  <li>• Pengajuan akan direview oleh tim kami dalam 1-2 hari kerja</li>
                  <li>• Investor akan melihat pengajuan Anda setelah disetujui</li>
                  <li>• Anda akan menerima notifikasi untuk setiap update status pengajuan</li>
                </ul>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" className="flex-1" disabled={submitting}>
                  {submitting ? "Memproses..." : "Kirim Pengajuan"}
                </Button>
                <Link href="/dashboard" className="flex-1">
                  <Button type="button" variant="outline" className="w-full bg-transparent">
                    Batal
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="border-border mt-8">
          <CardHeader>
            <CardTitle>Pertanyaan Umum</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-semibold text-foreground mb-2">Berapa lama proses review pengajuan?</h4>
              <p className="text-sm text-muted-foreground">
                Tim kami akan mereview pengajuan Anda dalam 1-2 hari kerja. Anda akan menerima notifikasi via email
                tentang status pengajuan.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Apa saja dokumen yang diperlukan?</h4>
              <p className="text-sm text-muted-foreground">
                Anda akan diminta untuk mengunggah dokumen pendukung seperti KTP, NPWP, dan laporan keuangan usaha
                setelah pengajuan awal disetujui.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Bagaimana jika pengajuan ditolak?</h4>
              <p className="text-sm text-muted-foreground">
                Jika pengajuan ditolak, kami akan memberikan alasan dan saran perbaikan. Anda dapat mengajukan kembali
                setelah melakukan perbaikan.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-2">Berapa bunga yang akan dikenakan?</h4>
              <p className="text-sm text-muted-foreground">
                Bunga ditentukan oleh investor berdasarkan profil risiko usaha Anda. Semakin baik profil Anda, semakin
                rendah bunga yang ditawarkan.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
