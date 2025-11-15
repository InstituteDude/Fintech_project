# ModaUMKM – Gotong Royong Invest

Aplikasi pendanaan UMKM berbasis **Next.js 16** + **Prisma MySQL**. Proyek ini menyediakan landing page peluang investasi, autentikasi dua peran (peminjam & investor), modul pengajuan modal, serta dashboard investor untuk menanam atau membatalkan investasi.

## Fitur Utama
- Landing page yang menampilkan daftar UMKM dan alasan investasi.
- Registrasi & login dengan **JWT cookie** (via lib/server-auth.ts).
- Peminjam dapat membuat pengajuan lengkap dengan profil pengelola + tautan sosial.
- Investor melihat progress pendanaan, menanam modal, serta membatalkan/hapus pengajuan (sesuai status).
- Backend sepenuhnya memakai API Route Next.js + Prisma (tidak ada localStorage).

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript
- Prisma ORM + MySQL
- PM2 untuk menjalankan build Next.js di VPS
- Nginx sebagai reverse proxy (opsional SSL)
- Utility: bcryptjs, jsonwebtoken, shadcn/ui components

---

## Menjalankan di Lokal

### 1. Clone & Install
```bash
git clone <URL_REPO> project_fintech
cd project_fintech
npm install --legacy-peer-deps
```

### 2. Konfigurasi Lingkungan
```bash
cp .env.example .env
```
Ubah `.env` sesuai kredensial MySQL lokal:
```
DATABASE_URL="mysql://user:password@127.0.0.1:3306/project_fintech"
JWT_SECRET="ganti-dengan-string-random"
```

### 3. Prisma & Database
```bash
npx prisma generate
npm run db:push    # atau npx prisma migrate dev
```

### 4. Running
```bash
npm run dev
```
Lalu akses `http://localhost:3000`.

---

## Deploy ke VPS (Ubuntu/Debian)

### 1. Persiapan Server
```bash
ssh admin@IP_VPS
sudo apt update
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs build-essential
sudo npm install -g pm2
```

### 2. Clone Repo
```bash
cd ~
git clone <URL_REPO> project_fintech
cd project_fintech
```

### 3. Install MySQL & Buat Database
```bash
sudo apt install mysql-server
sudo mysql_secure_installation   # opsional
```
Di MySQL shell:
```sql
CREATE DATABASE project_fintech CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'fintech_user'@'localhost' IDENTIFIED BY 'password-kuat';
GRANT ALL PRIVILEGES ON project_fintech.* TO 'fintech_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Buat `.env`
```
DATABASE_URL="mysql://fintech_user:password-kuat@127.0.0.1:3306/project_fintech"
JWT_SECRET="isi-dengan-string-random"
COOKIE_SECURE=false
```
> `COOKIE_SECURE=false` diperlukan jika server masih diakses via HTTP. Saat sudah punya domain + HTTPS (Nginx + Certbot), hapus atau set ke `true`.

### 5. Install Dependencies & Prisma
```bash
npm install --legacy-peer-deps
npx prisma generate
npx prisma migrate deploy   # atau npm run db:push
```

### 6. Build & Jalankan via PM2
```bash
npm run build
pm2 start npm --name project_fintech -- start -- -H 0.0.0.0
pm2 save
```
Monitoring log:
```bash
pm2 logs project_fintech
```

### 7. Nginx Reverse Proxy (opsional)
```
sudo apt install nginx
sudo nano /etc/nginx/sites-available/project_fintech
```
Isi file:
```
server {
  listen 80;
  server_name IP_VPS;  # ganti domain bila ada

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```
Aktifkan & reload:
```bash
sudo ln -s /etc/nginx/sites-available/project_fintech /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 8. SSL (hanya jika punya domain)
```
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d domainmu.com -d www.domainmu.com
```
Setelah HTTPS aktif, kembalikan `COOKIE_SECURE=true` dan `npm run build` + `pm2 restart project_fintech`.

---

## Troubleshooting

| Masalah | Penyebab | Solusi |
|---------|----------|--------|
| `npm install` gagal (ERESOLVE) | React 19 vs vaul 0.9.9 | Gunakan `npm install --legacy-peer-deps` |
| Login selalu “Email atau password salah” | User tidak ada di DB VPS | Daftar dari /register atau reset hash di MySQL |
| Login stuck di halaman (401 `/api/auth/me`) | Cookie Secure ditolak (akses HTTP) | Tambahkan `COOKIE_SECURE=false` atau pasang HTTPS |
| Port 3000 bentrok | Ada instance PM2/Next lain | `pm2 delete project_fintech` lalu start ulang; pastikan tidak ada proses lain di port 3000 |
| Tidak bisa diakses dari luar | Firewall belum buka port | `sudo ufw allow 3000/tcp` atau gunakan Nginx port 80/443 |

---

## Struktur Proyek (ringkas)
```
app/                # Halaman Next.js (landing, login, dashboard, dll)
lib/
  server-auth.ts    # JWT & cookie helper (bcrypt, jsonwebtoken)
  pengajuan.ts      # Client-side API wrapper
  prisma.ts         # Prisma client singleton
prisma/
  schema.prisma     # Definisi schema MySQL
public/             # Assets statis (favicon, logo)
types/              # Typing untuk user & pengajuan
```

---

## Catatan
- Selalu jalankan `npm run build` sebelum `pm2 restart` agar server memakai kode terbaru.
- Pengguna contoh/seed ada di `lib/seed.ts` dan otomatis dibuat jika tabel pengajuan kosong.
- Untuk mengedit file di VPS gunakan `nano path/to/file`. Setelah edit rebuild & restart.

Dengan README ini, pengembang lain dapat menjalankan proyek ini di lokal maupun di server produksi. Selamat berkontribusi!

