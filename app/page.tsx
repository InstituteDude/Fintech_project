"use client"

import Link from "next/link"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Users, Shield, Zap, ChevronRight, AlertCircle, ChevronLeft } from "lucide-react"
import { Progress } from "@/components/ui/progress"

const businessOpportunities = [
  // Makanan & Minuman (Food & Beverage)
  {
    id: 1,
    name: "Warung Makan Pak Budi",
    category: "Makanan & Minuman",
    description: "Ekspansi cabang warung makan dengan menu tradisional favorit komunitas",
    targetFunding: 500000000,
    collectedFunding: 385000000,
    daysLeft: 45,
    investors: 324,
    roi: "18%",
    image: "🍜",
  },
  {
    id: 2,
    name: "Kopi Specialty Jogja",
    category: "Makanan & Minuman",
    description: "Pembukaan kedai kopi premium dengan sistem online ordering terintegrasi",
    targetFunding: 350000000,
    collectedFunding: 245000000,
    daysLeft: 52,
    investors: 198,
    roi: "20%",
    image: "☕",
  },
  {
    id: 3,
    name: "Bakery Artisan Bandung",
    category: "Makanan & Minuman",
    description: "Ekspansi produksi bakery artisan dengan distributor ke resto dan hotel",
    targetFunding: 600000000,
    collectedFunding: 420000000,
    daysLeft: 38,
    investors: 267,
    roi: "19%",
    image: "🥐",
  },
  {
    id: 4,
    name: "Restoran Seafood Laut",
    category: "Makanan & Minuman",
    description: "Pembukaan outlet restoran seafood dengan lokasi premium di pusat kota",
    targetFunding: 800000000,
    collectedFunding: 560000000,
    daysLeft: 55,
    investors: 412,
    roi: "17%",
    image: "🦐",
  },
  {
    id: 5,
    name: "Es Cream Homemade",
    category: "Makanan & Minuman",
    description: "Franchise es krim premium dengan berbagai rasa unik dan natural ingredients",
    targetFunding: 280000000,
    collectedFunding: 198000000,
    daysLeft: 28,
    investors: 156,
    roi: "21%",
    image: "🍦",
  },
  // Fashion & Retail
  {
    id: 6,
    name: "Toko Elektronik Mapan",
    category: "Fashion & Retail",
    description: "Upgrade toko fisik dan platform e-commerce untuk jangkauan lebih luas",
    targetFunding: 750000000,
    collectedFunding: 520000000,
    daysLeft: 28,
    investors: 487,
    roi: "15%",
    image: "📱",
  },
  {
    id: 7,
    name: "Butik Fashion Muslim",
    category: "Fashion & Retail",
    description: "Koleksi busana muslim modern dengan desainer lokal dan bahan berkualitas",
    targetFunding: 450000000,
    collectedFunding: 315000000,
    daysLeft: 42,
    investors: 289,
    roi: "16%",
    image: "👗",
  },
  {
    id: 8,
    name: "Toko Sepatu Olahraga",
    category: "Fashion & Retail",
    description: "Ekspansi retail sepatu olahraga dengan brand lokal dan internasional",
    targetFunding: 550000000,
    collectedFunding: 385000000,
    daysLeft: 35,
    investors: 298,
    roi: "18%",
    image: "👟",
  },
  {
    id: 9,
    name: "Aksesoris Handmade Bali",
    category: "Fashion & Retail",
    description: "Peningkatan produksi aksesoris handmade untuk pasar lokal dan ekspor",
    targetFunding: 320000000,
    collectedFunding: 224000000,
    daysLeft: 48,
    investors: 167,
    roi: "22%",
    image: "📿",
  },
  {
    id: 10,
    name: "Brand Tas Kulit Lokal",
    category: "Fashion & Retail",
    description: "Pengembangan produk tas kulit asli dengan craftsmanship berkualitas tinggi",
    targetFunding: 680000000,
    collectedFunding: 476000000,
    daysLeft: 32,
    investors: 321,
    roi: "19%",
    image: "👜",
  },
  // Manufacturing
  {
    id: 11,
    name: "Pabrik Batik Nusantara",
    category: "Manufaktur",
    description: "Pembelian mesin produksi modern untuk tingkatkan kapasitas produksi",
    targetFunding: 1200000000,
    collectedFunding: 780000000,
    daysLeft: 62,
    investors: 156,
    roi: "22%",
    image: "🪡",
  },
  {
    id: 12,
    name: "Pabrik Mebel Minimalis",
    category: "Manufaktur",
    description: "Investasi mesin furnitur CNC untuk produksi mebel minimalis berkualitas",
    targetFunding: 950000000,
    collectedFunding: 665000000,
    daysLeft: 50,
    investors: 234,
    roi: "20%",
    image: "🪑",
  },
  {
    id: 13,
    name: "Industri Keramik Lokal",
    category: "Manufaktur",
    description: "Modernisasi pabrik keramik dengan teknologi kiln baru dan sistem produksi",
    targetFunding: 1100000000,
    collectedFunding: 715000000,
    daysLeft: 58,
    investors: 189,
    roi: "21%",
    image: "🏺",
  },
  {
    id: 14,
    name: "Pabrik Plastik Ramah Lingkungan",
    category: "Manufaktur",
    description: "Produksi plastik biodegradable dengan standar internasional",
    targetFunding: 1400000000,
    collectedFunding: 840000000,
    daysLeft: 65,
    investors: 267,
    roi: "19%",
    image: "♻️",
  },
  {
    id: 15,
    name: "Industri Tekstil Printing",
    category: "Manufaktur",
    description: "Peningkatan kapasitas printing tekstil dengan teknologi digital terbaru",
    targetFunding: 2000000000,
    collectedFunding: 1200000000,
    daysLeft: 70,
    investors: 334,
    roi: "18%",
    image: "🧵",
  },
  // Jasa & Layanan
  {
    id: 16,
    name: "Salon Kecantikan Shinta",
    category: "Jasa & Layanan",
    description: "Renovasi dan penambahan layanan spa premium di lokasi strategis",
    targetFunding: 400000000,
    collectedFunding: 295000000,
    daysLeft: 35,
    investors: 218,
    roi: "16%",
    image: "💆",
  },
  {
    id: 17,
    name: "Laundry Service Premium",
    category: "Jasa & Layanan",
    description: "Ekspansi laundry premium dengan teknologi dry cleaning modern",
    targetFunding: 300000000,
    collectedFunding: 210000000,
    daysLeft: 40,
    investors: 145,
    roi: "17%",
    image: "👔",
  },
  {
    id: 18,
    name: "Gym & Fitness Center",
    category: "Jasa & Layanan",
    description: "Pembukaan gym modern dengan personal trainer dan kelas group fitness",
    targetFunding: 850000000,
    collectedFunding: 595000000,
    daysLeft: 48,
    investors: 356,
    roi: "15%",
    image: "💪",
  },
  {
    id: 19,
    name: "Sekolah Kursus Online",
    category: "Jasa & Layanan",
    description: "Platform kursus online dengan instruktur berkualitas dan sertifikat resmi",
    targetFunding: 500000000,
    collectedFunding: 350000000,
    daysLeft: 45,
    investors: 267,
    roi: "20%",
    image: "📚",
  },
  {
    id: 20,
    name: "Agensi Event Organizer",
    category: "Jasa & Layanan",
    description: "Ekspansi event organizer dengan paket corporate dan wedding yang komprehensif",
    targetFunding: 600000000,
    collectedFunding: 420000000,
    daysLeft: 38,
    investors: 298,
    roi: "19%",
    image: "🎉",
  },
  // Teknologi & Digital
  {
    id: 21,
    name: "Startup Software Development",
    category: "Teknologi & Digital",
    description: "Pengembangan aplikasi mobile dan web untuk berbagai industri",
    targetFunding: 700000000,
    collectedFunding: 490000000,
    daysLeft: 44,
    investors: 312,
    roi: "24%",
    image: "💻",
  },
  {
    id: 22,
    name: "Platform E-Commerce Lokal",
    category: "Teknologi & Digital",
    description: "Marketplace khusus UMKM dengan sistem pembayaran dan logistik terintegrasi",
    targetFunding: 1500000000,
    collectedFunding: 900000000,
    daysLeft: 60,
    investors: 456,
    roi: "23%",
    image: "🛍️",
  },
  {
    id: 23,
    name: "Digital Marketing Agency",
    category: "Teknologi & Digital",
    description: "Agensi marketing digital dengan tim spesialis SEO, SEM, dan content creation",
    targetFunding: 450000000,
    collectedFunding: 315000000,
    daysLeft: 35,
    investors: 187,
    roi: "21%",
    image: "📊",
  },
  {
    id: 24,
    name: "Fintech Payment Gateway",
    category: "Teknologi & Digital",
    description: "Platform pembayaran digital untuk UMKM dengan rate kompetitif",
    targetFunding: 2500000000,
    collectedFunding: 1500000000,
    daysLeft: 75,
    investors: 587,
    roi: "25%",
    image: "💳",
  },
  {
    id: 25,
    name: "Cloud Storage Solution",
    category: "Teknologi & Digital",
    description: "Layanan cloud storage lokal dengan keamanan tingkat enterprise untuk bisnis",
    targetFunding: 1800000000,
    collectedFunding: 1080000000,
    daysLeft: 55,
    investors: 398,
    roi: "22%",
    image: "☁️",
  },
]

const ITEMS_PER_PAGE = 4
const TOTAL_PAGES = 5

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

const calculateProgress = (collected: number, target: number) => {
  return (collected / target) * 100
}

export default function LandingPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const groupedBusinesses = useMemo(() => {
    const grouped: Record<string, typeof businessOpportunities> = {}

    businessOpportunities.forEach((business) => {
      if (!grouped[business.category]) {
        grouped[business.category] = []
      }
      grouped[business.category].push(business)
    })

    return grouped
  }, [])

  const categories = Object.keys(groupedBusinesses)

  // Get items for current page
  const paginatedCategories = useMemo(() => {
    const itemsPerPage = 1 // Show 1 category per page with 4 items
    const startIdx = (currentPage - 1) * itemsPerPage
    const endIdx = startIdx + itemsPerPage
    return categories.slice(startIdx, endIdx)
  }, [currentPage, categories])

  const displayedBusinesses = useMemo(() => {
    return paginatedCategories.flatMap((cat) => groupedBusinesses[cat])
  }, [paginatedCategories, groupedBusinesses])

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">Gotong Royong & Invest</div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="outline">Masuk</Button>
            </Link>
            <Link href="/register">
              <Button>Daftar</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground leading-tight">
              Bangun Bisnis Impian Bersama Komunitas
            </h1>
            <p className="text-lg text-muted-foreground">
              Platform patungan permodalan yang menghubungkan pengusaha UMKM dengan investor. Transparansi penuh, proses
              cepat, tanpa biaya tersembunyi.
            </p>
            <div className="flex gap-4 pt-4">
              <Link href="/register">
                <Button size="lg" className="text-base">
                  Investasi Sekarang
                </Button>
              </Link>
              <Link href="#bisnis">
                <Button size="lg" variant="outline" className="text-base bg-transparent">
                  Lihat Bisnis Potensial
                </Button>
              </Link>
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-12 flex items-center justify-center min-h-96">
            <div className="text-center space-y-6">
              <div className="text-6xl">📊</div>
              <div>
                <div className="text-4xl font-bold text-primary">Rp 2.68 M</div>
                <p className="text-muted-foreground">Dana Terkumpul</p>
              </div>
              <div className="flex gap-6 justify-center text-sm">
                <div>
                  <div className="font-bold text-foreground">1,847</div>
                  <p className="text-muted-foreground">Investor</p>
                </div>
                <div>
                  <div className="font-bold text-foreground">24</div>
                  <p className="text-muted-foreground">Bisnis Aktif</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bisnis Potensial Section */}
      <section id="bisnis" className="bg-card py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-start mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Bisnis Potensial</h2>
              <p className="text-lg text-muted-foreground">
                Pilihan bisnis yang sedang mengumpulkan dana untuk ekspansi dan pertumbuhan
              </p>
            </div>
            <Link href="/bisnis">
              <Button variant="outline" className="gap-2 bg-transparent">
                Lihat Semua <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Category Display */}
          {paginatedCategories.map((category) => (
            <div key={category} className="mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-6 pb-3 border-b-2 border-secondary">{category}</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6">
                {groupedBusinesses[category].slice(0, ITEMS_PER_PAGE).map((business) => (
                  <Card key={business.id} className="border-border hover:shadow-lg transition-shadow overflow-hidden">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start mb-4">
                        <div className="text-4xl">{business.image}</div>
                        <span className="text-xs font-semibold bg-secondary/20 text-secondary-700 px-3 py-1 rounded-full">
                          {business.category}
                        </span>
                      </div>
                      <CardTitle className="line-clamp-1">{business.name}</CardTitle>
                      <CardDescription className="line-clamp-2">{business.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Funding Progress */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-foreground">Progress Pendanaan</span>
                          <span className="text-sm font-bold text-primary">
                            {calculateProgress(business.collectedFunding, business.targetFunding).toFixed(0)}%
                          </span>
                        </div>
                        <Progress
                          value={calculateProgress(business.collectedFunding, business.targetFunding)}
                          className="h-2"
                        />
                      </div>

                      {/* Funding Details */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground text-xs mb-1">Terkumpul</p>
                          <p className="font-semibold text-foreground">{formatCurrency(business.collectedFunding)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs mb-1">Target</p>
                          <p className="font-semibold text-foreground">{formatCurrency(business.targetFunding)}</p>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-3 py-3 border-t border-border">
                        <div>
                          <p className="text-muted-foreground text-xs">Investor</p>
                          <p className="font-semibold text-foreground">{business.investors}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">ROI</p>
                          <p className="font-semibold text-secondary">{business.roi}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground text-xs">Hari Tersisa</p>
                          <p className="font-semibold text-foreground">{business.daysLeft}</p>
                        </div>
                      </div>

                      {/* Action */}
                      <Link href="/register" className="block">
                        <Button className="w-full" size="sm">
                          Investasi
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}

          {/* Pagination Controls */}
          <div className="flex items-center justify-center gap-4 mt-12 pt-8 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="gap-2 bg-transparent"
            >
              <ChevronLeft className="w-4 h-4" />
              Sebelumnya
            </Button>

            <div className="flex gap-2">
              {Array.from({ length: Math.min(TOTAL_PAGES, categories.length) }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className={currentPage === page ? "" : "bg-transparent"}
                >
                  {page}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(categories.length, prev + 1))}
              disabled={currentPage >= categories.length}
              className="gap-2 bg-transparent"
            >
              Selanjutnya
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Mengapa Gotong Royong & Invest?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Platform terpercaya untuk pertumbuhan bersama komunitas
          </p>
        </div>

        {/* ... existing services code ... */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Service 1 */}
          <Card className="border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Pengajuan Mudah</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Proses pengajuan pinjaman yang sederhana dan cepat hanya dalam beberapa menit.
              </p>
            </CardContent>
          </Card>

          {/* Service 2 */}
          <Card className="border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Komunitas Investor</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Terhubung dengan ribuan investor yang siap mendukung pertumbuhan bisnis Anda.
              </p>
            </CardContent>
          </Card>

          {/* Service 3 */}
          <Card className="border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Keamanan Terjamin</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Data dan transaksi Anda dilindungi dengan enkripsi tingkat enterprise.
              </p>
            </CardContent>
          </Card>

          {/* Service 4 */}
          <Card className="border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Proses Cepat</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Pencairan dana dalam waktu singkat setelah persetujuan dari investor.
              </p>
            </CardContent>
          </Card>

          {/* Additional Services */}
          <Card className="border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-lg">Return Konsisten</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Potensi return yang kompetitif dengan transparansi penuh laporan bisnis.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <CardTitle className="text-lg">Komunitas Kuat</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Bergabung dengan ribuan investor yang saling mendukung pertumbuhan bisnis.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-accent-700" />
              </div>
              <CardTitle className="text-lg">Keamanan Terjamin</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Perlindungan data dan transaksi dengan standar keamanan enterprise.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-light/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-light-700" />
              </div>
              <CardTitle className="text-lg">Proses Mudah</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Investasi dimulai dari Rp 100.000 dengan proses yang cepat dan simpel.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-card py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Cara Kerja Investasi</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Daftar & Verifikasi</h3>
              <p className="text-muted-foreground">Buat akun dan lengkapi verifikasi identitas Anda dengan mudah.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-secondary text-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Pilih Bisnis</h3>
              <p className="text-muted-foreground">Lihat detail bisnis, analisis ROI, dan keputusan investasi Anda.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Terima Return</h3>
              <p className="text-muted-foreground">Dapatkan return periodik sesuai performa bisnis yang Anda pilih.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Info Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-accent/10 border border-accent/20 rounded-xl p-6 flex gap-4">
          <AlertCircle className="w-6 h-6 text-accent-700 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-foreground mb-2">Penting: Risiko Investasi</h3>
            <p className="text-muted-foreground text-sm">
              Investasi pada bisnis UMKM memiliki risiko. Pastikan Anda memahami detail bisnis, laporan keuangan, dan
              proyeksi sebelum berinvestasi. Diversifikasi investasi Anda di beberapa bisnis untuk mengurangi risiko.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Gotong Royong & Invest</h3>
              <p className="text-sm opacity-90">Platform patungan permodalan untuk UMKM Indonesia.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Produk</h4>
              <ul className="space-y-2 text-sm opacity-90">
                <li>
                  <a href="#bisnis" className="hover:opacity-100">
                    Bisnis Potensial
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:opacity-100">
                    Investasi
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:opacity-100">
                    Dashboard
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Perusahaan</h4>
              <ul className="space-y-2 text-sm opacity-90">
                <li>
                  <a href="#" className="hover:opacity-100">
                    Tentang Kami
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:opacity-100">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:opacity-100">
                    Karir
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm opacity-90">
                <li>
                  <a href="#" className="hover:opacity-100">
                    Privasi
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:opacity-100">
                    Syarat & Ketentuan
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:opacity-100">
                    Hubungi Kami
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-foreground/20 pt-8 text-center text-sm opacity-90">
            <p>&copy; 2025 Gotong Royong & Invest. Semua hak dilindungi.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
