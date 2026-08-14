# CLAUDE.md — Panduan kerja untuk repo Pudingku

Dokumen ini adalah kontrak kerja untuk siapa pun (manusia atau agen AI) yang
menyentuh repo ini. **Setiap kali ada perubahan aturan kode, fitur, atau konten,
file ini WAJIB diperbarui** — bersama halaman compliance dan kedua file
terjemahan.

---

## 1. Ringkasan proyek

Pudingku adalah website katalog + ecommerce untuk usaha puding dan kue.

| Hal | Nilai |
| --- | --- |
| Framework | Nuxt **4.5** (`future.compatibilityVersion: 4`) |
| Bahasa | TypeScript strict |
| Styling | SCSS (sass-embedded), **tanpa CSS framework** |
| State | Pinia |
| i18n | `@nuxtjs/i18n` v10 — default **ID**, alternatif **EN** |
| Node | dev/build butuh `^20.19.0 \|\| >=22.12.0`. **`npm run lint` butuh Node ≥ 22** (ESLint memakai `Object.groupBy`) |
| Katalog | 16 produk: 10 varian puding + 6 kue |
| Repo | `git@github.com:maulanayusupp/pudingku.git` |

---

## 2. Struktur direktori

```
app/                      srcDir Nuxt 4
├── assets/scss/          SATU-SATUNYA tempat styling global
│   ├── _tokens.scss      CSS custom properties (warna, spasi, tipografi, motion)
│   ├── _functions.scss   rem(), fluid(), transition-list()
│   ├── _mixins.scss      container, surface, jelly, focus-ring, grain, …
│   ├── _breakpoints.scss up()/down()/between()/hover-capable/reduced-motion
│   ├── _reset.scss       reset modern
│   ├── _typography.scss  skala tipe global + .pk-prose
│   ├── _animations.scss  keyframes + .pk-reveal / .pk-stagger / .pk-skeleton
│   ├── _utilities.scss   utility kecil (.pk-container, .pk-sr-only, …)
│   ├── _abstracts.scss   FORWARD functions+mixins+breakpoints (dipakai komponen)
│   └── main.scss         satu-satunya file di nuxt.config `css`
├── components/           pathPrefix: false → nama file = nama tag
│   ├── base/             BaseButton, BaseBadge, BaseField, BaseInput, …
│   ├── cart/             CartDrawer, CartLineItem, CartSummary, FreeDeliveryMeter
│   ├── common/           EmptyState, AccordionItem, BreadcrumbTrail
│   ├── home/             HeroSection, MarqueeRibbon, SignatureRail, …
│   ├── layout/           AppHeader, AppFooter, MobileMenu, BrandMark, …
│   └── product/          ProductCard, ProductGrid, ProductFilters, ProductImage, AllergenList
├── composables/          useCatalog, useForm, useMoney, useSeoPage, useDialogFocus, …
├── constants/            navigation.ts, pricing.ts
├── layouts/default.vue
├── pages/
├── plugins/              cart.client.ts, reveal.ts
├── services/             http.ts + *.service.ts  ← satu-satunya pemanggil /api
├── stores/               cart.ts, order.ts
└── utils/                helper murni (auto-import): format, validation, collection, storage

i18n/locales/{id,en}.json  SEMUA teks statis
server/
├── api/                  route Nitro
├── data/products.ts      data katalog (multi-locale)
└── services/             catalog.repository.ts, pricing.ts
shared/
├── config/site.ts        fakta bisnis + flag `verified`
├── types/                tipe dipakai app + server
└── utils/reference.ts
scripts/                  generator ilustrasi produk & favicon
```

---

## 3. Aturan kode

### 3.1 Styling — tidak ada inline CSS

* **Dilarang** atribut `style="…"` maupun binding `:style` di template.
* Semua style komponen ada di blok `<style lang="scss" scoped>` milik komponen
  itu, diawali `@use 'abstracts' as *;`.
* Style global hanya di `app/assets/scss/`. Hanya `main.scss` yang didaftarkan
  di `nuxt.config`.
* Token warna/spasi/motion **selalu** lewat CSS custom property (`var(--pk-…)`),
  jangan hardcode hex di komponen.
* Kalau butuh nilai dinamis dari data (mis. warna aksen produk), tulis lewat
  `element.style.setProperty('--pk-…', value)` di script — bukan `:style` di
  template. Lihat `ProductCard.vue` dan `FreeDeliveryMeter.vue`.
* Untuk stagger animasi pakai `@for` + `:nth-child` di SCSS
  (`.pk-stagger`), bukan `style="--i:n"`.

### 3.2 Komponen

* Satu komponen = satu tanggung jawab. Folder hanya untuk pengelompokan; nama
  file harus unik secara global karena `pathPrefix: false`.
* Props pakai `defineProps<T>()` dengan interface bernama dan komentar per
  properti yang tidak jelas.
* `v-model` pakai `defineModel()`.
* Elemen interaktif tidak boleh bersarang di dalam `<a>`/`<NuxtLink>`. Pola
  "kartu bisa diklik + tombol" ada di `ProductCard.vue`.

### 3.3 Helper vs composable vs service

| Lapisan | Lokasi | Boleh berisi | Auto-import |
| --- | --- | --- | --- |
| Helper | `app/utils/` | fungsi murni, tanpa Vue/Nuxt | ya |
| Composable | `app/composables/` | reaktivitas, lifecycle, i18n | ya |
| Service | `app/services/` | pemanggilan HTTP | **tidak** (import eksplisit `~/services/…`) |
| Repository | `server/services/` | akses sumber data | — |

* Komponen **tidak boleh** memanggil `/api/...` langsung. Selalu lewat service.
* Service mengembalikan error `HttpError` berisi **kunci terjemahan**, bukan
  kalimat jadi.

### 3.4 Validasi

* Aturan ada di `app/utils/validation.ts` dan mengembalikan **kunci
  terjemahan** (`validation.email`), bukan kalimat.
* Form pakai `useForm()`. Schema boleh berupa `computed` untuk aturan
  bersyarat (lihat checkout: alamat hanya wajib saat metode = diantar).
* Server **selalu** memvalidasi ulang dan **selalu** menghitung ulang harga.
  Harga yang dikirim client tidak pernah dipercaya.

### 3.5 Aksesibilitas (wajib, bukan opsional)

* Setiap ikon dekoratif: `aria-hidden="true"`.
* Setiap tombol ikon-saja: `aria-label`.
* Fokus keyboard selalu terlihat (`@include focus-ring`).
* Overlay (`CartDrawer`, `MobileMenu`): kunci scroll, jebak fokus, tutup dengan
  Escape, kembalikan fokus saat ditutup.
* Semua animasi menghormati `prefers-reduced-motion`.

### 3.6 SEO

* Setiap halaman memanggil `useSeoPage({ title, description, … })`.
* Halaman keranjang/checkout: `noindex: true` (dan sudah di-`disallow` di
  robots.txt).
* Structured data dibangun dari **data yang sama** dengan yang ditampilkan.
  Jangan pernah mengirim harga/ketersediaan ke schema.org yang berbeda dari
  yang terlihat di halaman.

---

## 4. Aturan konten (paling penting)

### 4.1 Jangan over-claim

Dilarang menulis di mana pun (produk, halaman, meta, schema):

* superlatif tanpa bukti — "terbaik", "nomor satu", "paling enak se-Jakarta";
* jumlah pelanggan, rating, jumlah review, atau testimoni yang tidak nyata;
* klaim kesehatan ("menyehatkan", "rendah kalori", "aman untuk diabetes");
* penghargaan, sertifikasi, atau nomor izin yang dokumennya belum ada;
* "gratis ongkir se-Indonesia" atau janji layanan yang belum bisa dipenuhi.

Yang boleh: deskripsi rasa, tekstur, bahan, proses, dan komitmen yang memang
ada di bawah kendali usaha.

### 4.2 Jangan berasumsi soal data bisnis

`shared/config/site.ts` menyimpan setiap fakta bisnis dengan flag `verified`.
Nilai yang belum dikonfirmasi pemilik **tidak dirender sama sekali** — bukan
diisi contoh. Helper `confirmed()` yang mengaturnya.

Saat ini yang **sudah** dikonfirmasi hanya: nama pemilik dan email.
Belum: telepon, alamat, jam operasional, media sosial, NIB/NPWP, nomor halal,
nomor izin edar.

### 4.3 Fitur yang belum jalan harus dinyatakan

Build ini **belum** punya payment gateway, database pesanan, dan layanan email.
Karena itu wajib ada dan tidak boleh dihapus:

| Tempat | Isi |
| --- | --- |
| `/checkout` | `BaseNotice` "Ini alur demo" |
| `/checkout/berhasil` | penjelasan bahwa langkah nyata = kirim referensi via email |
| `/kontak` | notice bahwa formulir belum benar-benar mengirim |
| `/kepatuhan` | blok `compliance.statusTitle` / `statusBody` |
| `server/api/orders/index.post.ts` | komentar "DEMO ONLY" |
| Footer | `footer.builtNote` |

Saat integrasi nyata dipasang, hapus notice-nya **dan** perbarui:
`compliance.docs.privacy`, `compliance.docs.terms`, `compliance.docs.shipping`,
`runtimeConfig.public.checkoutIsDemo`, TODO.md, dan file ini.

---

## 5. Multibahasa

* Bahasa default **ID tanpa prefix URL**; EN di bawah `/en`.
* URL ikut bahasa: `/produk` ↔ `/en/products`. Peta ada di `nuxt.config` →
  `i18n.pages`, dengan kunci = path file di `app/pages` tanpa ekstensi.
* **Setiap teks statis baru WAJIB ditambahkan ke `i18n/locales/id.json` DAN
  `i18n/locales/en.json` pada saat yang sama.** Tidak boleh ada string
  hardcoded di komponen.
* Teks produk multi-locale ada di `server/data/products.ts`
  (`{ id: '…', en: '…' }`), bukan di file locale.
* Karakter `@` di dalam pesan harus di-escape jadi `{'@'}` — vue-i18n
  memperlakukan `@` sebagai penanda linked message.
* Pluralisasi pakai format `"{count} item | {count} item"` dan dipanggil
  `t('key', count, { count })`.
* Setiap penambahan halaman compliance: tambahkan slug ke `COMPLIANCE_DOCS`
  (`app/constants/navigation.ts`) dan blok `sections` di **kedua** file locale.

---

## 6. Aset & generator

| Perintah | Hasil |
| --- | --- |
| `npm run art:products` | 16 SVG di `public/images/products/` |
| `npm run art:favicon` | favicon.ico/svg, apple-touch-icon, ikon PWA, `site.webmanifest`, OG image |
| `npm run art:all` | keduanya |

* Ilustrasi produk **digenerate**, bukan foto stok. Alasannya: setiap gambar
  cocok dengan deskripsi produknya sendiri (jumlah lapisan, warna, topping),
  tidak ada masalah lisensi, dan ukurannya kecil.
* Generator bersifat deterministik (seeded PRNG), jadi regenerasi tidak
  menghasilkan diff palsu.
* Menambah produk baru = tambah entri di `server/data/products.ts` **dan** spec
  di `scripts/generate-product-art.mjs` dengan `slug` yang sama, lalu jalankan
  `npm run art:products`.
* Ilustrasi produk dirender lewat `<ProductImage>` (plain `<img>`), **bukan**
  `<NuxtImg>`: file-nya SVG, jadi pipeline IPX hanya merasterisasi dan
  memperburuk ketajaman. `@nuxt/image` tetap ada untuk aset raster.

---

## 7. Alur kerja Git

* Author commit **wajib**: `Maulana Yusup Abdullah <maulanayusupp@gmail.com>`.
  Sudah diset di `.git/config` lokal. Jangan pakai identitas agen AI.
* Pesan commit berbahasa Indonesia, format Conventional Commits
  (`feat:`, `fix:`, `docs:`, `refactor:`, `chore:`).
* Setiap perubahan yang selesai langsung `commit` dan `push` ke `origin main`.

---

## 8. Checklist sebelum menutup sebuah perubahan

- [ ] Tidak ada `style="…"` / `:style` baru di template.
- [ ] Tidak ada string teks hardcoded — semua lewat `t()`.
- [ ] `i18n/locales/id.json` **dan** `en.json` sama-sama diperbarui.
- [ ] Halaman compliance masih menggambarkan kondisi sistem yang sebenarnya.
- [ ] `shared/config/site.ts` tidak berisi data karangan.
- [ ] Tidak ada klaim baru yang tidak bisa dibuktikan.
- [ ] `npx nuxt build` lolos (termasuk prerender).
- [ ] CLAUDE.md ini diperbarui bila ada aturan/fitur baru.
- [ ] TODO.md diperbarui untuk pekerjaan lanjutan.
- [ ] Commit + push dengan author yang benar.
