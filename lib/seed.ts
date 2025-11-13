import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/server-auth"
import { PengajuanStatus } from "@prisma/client"

const sampleBusinesses = [
  {
    namaUsaha: "Warung Makan Nusantara",
    deskripsi:
      "Warung makan keluarga dengan menu nusantara yang ingin melakukan ekspansi dapur dan layanan pesan antar.",
    ownerProfile:
      "Siti Rahma telah mengelola warung makan keluarga selama 12 tahun dengan fokus pada bahan segar dari petani lokal. Ia aktif membina komunitas ibu-ibu sekitar untuk memasak sehat.",
    ownerSocial: {
      instagram: "https://www.instagram.com/warungnusantara.id",
      linkedin: "https://www.linkedin.com/in/sitirahma/",
    },
    jumlahPinjaman: 450_000_000,
    jangkaWaktu: 18,
    tujuanPinjaman: "Ekspansi dapur dan peralatan masak",
  },
  {
    namaUsaha: "Kopi Speciality Bandung",
    deskripsi: "Kedai kopi specialty yang ingin membuka cabang baru dengan konsep drive thru.",
    ownerProfile:
      "Dimas Prasetyo adalah Q-grader tersertifikasi yang telah membina petani kopi di Garut dan Bandung Barat. Ia sering mengisi kelas roasting dan aktif di komunitas kopi nasional.",
    ownerSocial: {
      instagram: "https://www.instagram.com/kopidimas.id",
      linkedin: "https://www.linkedin.com/in/dimasprasetyo/",
      website: "https://kopispecialitybdg.com",
    },
    jumlahPinjaman: 300_000_000,
    jangkaWaktu: 12,
    tujuanPinjaman: "Pembukaan cabang dan branding",
  },
  {
    namaUsaha: "Batik Kreasi Jogja",
    deskripsi: "Produsen batik modern yang ingin meningkatkan kapasitas produksi dan kanal distribusi online.",
    ownerProfile:
      "Nadya Wulandari adalah generasi kedua perajin batik yang fokus mengangkat motif kontemporer ramah lingkungan. Ia aktif memasarkan produk UMKM lewat kampanye digital.",
    ownerSocial: {
      instagram: "https://www.instagram.com/batikkreasijogja",
      facebook: "https://www.facebook.com/batikkreasijogja",
    },
    jumlahPinjaman: 520_000_000,
    jangkaWaktu: 24,
    tujuanPinjaman: "Mesin produksi dan pemasaran digital",
  },
]

let seedingPromise: Promise<void> | null = null

export function ensureSeedData() {
  if (!seedingPromise) {
    seedingPromise = seed()
  }

  return seedingPromise
}

async function seed() {
  const pengajuanCount = await prisma.pengajuan.count()
  if (pengajuanCount > 0) {
    return
  }

  const password = await hashPassword("Demo123!")

  const demoBorrower = await prisma.user.upsert({
    where: { email: "demo.umkm@example.com" },
    update: {},
    create: {
      email: "demo.umkm@example.com",
      name: "UMKM Demo",
      password,
      role: "PEMINJAM",
    },
  })

  await Promise.all(
    sampleBusinesses.map((business) =>
      prisma.pengajuan.create({
        data: {
          ...business,
          userId: demoBorrower.id,
          status: PengajuanStatus.APPROVED,
        },
      }),
    ),
  )
}
