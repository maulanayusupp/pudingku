# TODO — Pudingku

Daftar pekerjaan lanjutan. Urutan di dalam tiap bagian sudah dari yang paling
mendesak. Kalau sebuah item selesai, hapus dari sini dan catat di `CLAUDE.md`
bila menambah aturan baru.

---

## 0. Data bisnis yang harus diverifikasi (blocker sebelum live)

Semua ini disimpan di `shared/config/site.ts` dengan flag `verified: false`,
sehingga **tidak dirender** sampai diisi. Jangan mengarang nilainya.

- [ ] Nomor telepon / WhatsApp untuk umum
- [ ] Alamat dapur (atau keputusan untuk tetap tidak dipublikasikan)
- [ ] Kota & wilayah layanan pengiriman yang pasti
- [ ] Jam operasional / jam terima pesanan
- [ ] Akun Instagram / TikTok (kalau ada)
- [ ] NIB, NPWP, atau bentuk badan usaha
- [ ] Nomor sertifikat halal — **jangan dicantumkan sebelum dokumennya ada**
- [ ] Nomor izin edar pangan olahan (P-IRT / BPOM)
- [ ] Domain produksi → set `NUXT_PUBLIC_SITE_URL` (default sekarang
      `https://pudingku.id`, belum dikonfirmasi)

Setelah diisi: flip `verified: true`, lalu perbarui halaman
`/kepatuhan/allergens`, `/kepatuhan/shipping`, dan bagian
`about.transparency` di kedua file locale.

---

## 1. Ecommerce — melengkapi yang masih demo

- [ ] **Payment gateway.** Kandidat: Midtrans Snap, Xendit, atau HitPay.
      Butuh: server route `POST /api/payments/create`, webhook verifikasi,
      halaman status pembayaran. Setelah aktif → hapus semua notice demo
      (daftar lengkapnya di `CLAUDE.md` §4.3) dan set
      `runtimeConfig.public.checkoutIsDemo = false`.
- [ ] **Penyimpanan pesanan.** Saat ini `POST /api/orders` hanya menghitung dan
      mengembalikan ringkasan. Perlu database (Postgres/Supabase/Turso) +
      migrasi + repository di `server/services/order.repository.ts`.
- [ ] **Pengiriman email.** Konfirmasi pesanan ke pelanggan dan notifikasi ke
      pemilik. Kandidat: Resend atau Brevo. Setelah aktif → hapus notice di
      `/kontak` dan aktifkan pengiriman di `POST /api/contact`.
- [ ] **Ongkos kirim nyata.** `server/services/pricing.ts` sekarang memakai
      angka datar Rp20.000 dan gratis di atas Rp300.000 — itu placeholder.
      Ganti dengan tarif kurir per jarak, lalu perbarui
      `compliance.docs.shipping` di kedua bahasa.
- [ ] **Stok & kapasitas produksi harian.** Batasi jumlah pesanan per tanggal
      supaya kapasitas dapur tidak terlampaui.
- [ ] **Kalender tanggal tersedia** di checkout (blokir tanggal yang penuh dan
      tanggal yang lebih cepat dari lead time produk di keranjang).
- [ ] **Kode promo / voucher.**
- [ ] **Halaman lacak pesanan** dengan nomor referensi.
- [ ] Simpan alamat pengiriman terakhir di localStorage supaya pesanan
      berikutnya lebih cepat.

## 2. Katalog & konten

- [ ] Foto produk asli. Ilustrasi SVG sekarang sudah unik per produk dan tidak
      menyesatkan, tapi foto nyata akan lebih meyakinkan. Simpan sebagai raster
      dan pakai `<NuxtImg>` (bukan `<ProductImage>`) supaya masuk pipeline IPX.
- [ ] Varian ukuran per produk (mis. cup 180 ml vs 350 ml, loyang 18 vs 22 cm).
- [ ] Paket hampers / bundling untuk hadiah.
- [ ] Menu musiman (Ramadan, Natal, Imlek) dengan tanggal aktif.
- [ ] Halaman "Cara menyimpan & menyajikan" dengan ilustrasi.
- [ ] Blog / jurnal dapur untuk SEO jangka panjang (butuh `@nuxt/content`).
- [ ] **Ulasan pelanggan.** Sengaja belum ada — menampilkan review karangan
      melanggar aturan konten. Baru boleh dipasang setelah ada ulasan nyata
      yang terverifikasi, lalu tambahkan `AggregateRating` ke schema produk.

## 3. UI / UX

- [ ] Mode gelap (`@nuxtjs/color-mode`). Token sudah siap di `_tokens.scss`,
      tinggal menambah blok override.
- [ ] Quick view produk dari kartu katalog tanpa pindah halaman.
- [ ] Toast global untuk aksi "masuk keranjang" (sekarang langsung membuka
      drawer — cukup, tapi bisa lebih halus).
- [ ] Perbandingan produk berdampingan.
- [ ] Filter tambahan: alergen, rentang harga, waktu penyiapan.
- [ ] Simpan posisi scroll katalog saat kembali dari halaman produk.
- [ ] Skeleton yang lebih menyerupai kartu asli (sekarang blok polos).

## 4. Kualitas & infrastruktur

- [ ] **Jalankan lint di CI.** `npm run lint` gagal di Node 20 karena
      `eslint-flat-config-utils` memakai `Object.groupBy` (Node ≥ 21).
      Pakai Node 22 di CI, atau naikkan Node lokal.
- [ ] Unit test untuk `app/utils/*` (Vitest) — format, validation, collection.
- [ ] Test komponen untuk `useForm` dan store keranjang.
- [ ] E2E untuk alur beli (Playwright).
- [ ] GitHub Actions: install → build → lint → test.
- [ ] Lighthouse budget + cek regresi performa.
- [ ] Error tracking (Sentry) setelah domain produksi ada.
- [ ] Rate limiting di `POST /api/contact` dan `POST /api/orders` sebelum
      keduanya benar-benar mengirim/menyimpan sesuatu.
- [ ] Header keamanan (`nuxt-security`): CSP, HSTS, X-Frame-Options.

## 5. SEO & analitik

- [ ] Verifikasi Google Search Console setelah domain final.
- [ ] `LocalBusiness` schema — butuh alamat & jam operasional yang terverifikasi
      lebih dulu (lihat bagian 0).
- [ ] OG image per produk (butuh `@nuxtjs/og-image` atau render manual).
- [ ] Analitik yang menghormati privasi (Plausible / Umami).
      **Catatan:** begitu analitik dipasang, `CookieNotice` harus diganti dari
      pemberitahuan menjadi consent manager yang sebenarnya, dan
      `compliance.docs.cookies` + `compliance.docs.privacy` wajib diperbarui di
      kedua bahasa.

## 6. Bahasa

- [ ] Tambah bahasa ketiga bila perlu (mis. `zh` untuk pasar tertentu):
      daftarkan di `nuxt.config` → `i18n.locales`, tambahkan
      `i18n/locales/<kode>.json` lengkap, tambahkan path di `i18n.pages`, dan
      tambahkan kolom locale di `server/data/products.ts`
      (`shared/types/catalog.ts` → `LocaleCode`).
- [ ] Terjemahkan nama produk secara konsisten bila ada bahasa baru.
