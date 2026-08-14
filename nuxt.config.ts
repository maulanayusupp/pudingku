import { fileURLToPath } from 'node:url'

/**
 * Pudingku — Nuxt 4 configuration.
 *
 * Conventions enforced here (documented in CLAUDE.md):
 * - `app/` is the source dir (Nuxt 4 default).
 * - SCSS is the only styling language; `app/assets/scss` is added to Sass
 *   `loadPaths` so every SFC can `@use 'abstracts' as *;`.
 * - Indonesian is the default locale and is served without a URL prefix.
 * - Every public value that could differ per environment goes through
 *   `runtimeConfig.public` so no deploy needs a rebuild to change it.
 */

const SITE_URL = process.env.NUXT_PUBLIC_SITE_URL || 'https://pudingku-hazel.vercel.app'
const SITE_NAME = 'Pudingku'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  future: {
    compatibilityVersion: 4,
  },

  devtools: { enabled: true },

  modules: [
    '@nuxtjs/i18n',
    '@nuxt/icon',
    '@nuxt/fonts',
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'nuxt-schema-org',
    '@nuxtjs/sitemap',
    '@nuxtjs/robots',
    '@nuxt/eslint',
  ],

  css: ['~/assets/scss/main.scss'],

  // Folders group components by domain, but the file name alone is the tag
  // name — `components/product/ProductCard.vue` is `<ProductCard>`, not
  // `<ProductProductCard>`. File names are therefore globally unique.
  components: [
    { path: '~/components', pathPrefix: false },
  ],

  runtimeConfig: {
    public: {
      siteUrl: SITE_URL,
      siteName: SITE_NAME,
      /** Flip to `true` only once a real payment gateway is wired up. */
      checkoutIsDemo: true,
    },
  },

  site: {
    url: SITE_URL,
    name: SITE_NAME,
    defaultLocale: 'id',
  },

  app: {
    pageTransition: { name: 'pk-page', mode: 'out-in' },
    layoutTransition: { name: 'pk-page', mode: 'out-in' },
    head: {
      htmlAttrs: { lang: 'id' },
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico', sizes: '32x32' },
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
      meta: [
        { name: 'theme-color', content: '#4b1b39' },
        { name: 'format-detection', content: 'telephone=no' },
      ],
    },
  },

  // ── Internationalisation ───────────────────────────────────────────────────
  // Translation files live in `i18n/locales/*.json`. Any new static string must
  // be added to BOTH files (see CLAUDE.md → "Menambah teks baru").
  i18n: {
    defaultLocale: 'id',
    strategy: 'prefix_except_default',
    baseUrl: SITE_URL,
    locales: [
      { code: 'id', language: 'id-ID', name: 'Bahasa Indonesia', file: 'id.json', dir: 'ltr' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json', dir: 'ltr' },
    ],
    // Browser-language detection is OFF on purpose. With it enabled, a visitor
    // whose browser prefers English got 302-redirected from `/` to `/en`, which
    // contradicts the requirement that Indonesian is the default. The active
    // language is carried by the URL instead — shareable, cacheable, and
    // unambiguous — and the language switcher links to the equivalent page.
    // Side effect: no `pk_locale` cookie is set, so the site now sets no
    // cookies at all. Keep `/kepatuhan/cookies` in step with that.
    detectBrowserLanguage: false,
    bundle: {
      optimizeTranslationDirective: false,
    },
    // Localised URLs: Indonesian visitors get Indonesian slugs, which is the
    // primary market. Page keys map to files under `app/pages`.
    customRoutes: 'config',
    // Keys are page file paths relative to `app/pages`, without the extension.
    pages: {
      'products/index': { id: '/produk', en: '/products' },
      'products/[slug]': { id: '/produk/[slug]', en: '/products/[slug]' },
      'cart': { id: '/keranjang', en: '/cart' },
      'checkout/index': { id: '/checkout', en: '/checkout' },
      'checkout/success': { id: '/checkout/berhasil', en: '/checkout/success' },
      'about': { id: '/tentang', en: '/about' },
      'contact': { id: '/kontak', en: '/contact' },
      'faq': { id: '/tanya-jawab', en: '/faq' },
      'compliance/index': { id: '/kepatuhan', en: '/compliance' },
      'compliance/[doc]': { id: '/kepatuhan/[doc]', en: '/compliance/[doc]' },
    },
  },

  // ── Assets ─────────────────────────────────────────────────────────────────
  // `@nuxt/image` is deliberately NOT installed. All product art is SVG and all
  // share cards are pre-rendered at build time by `npm run art:og`, so nothing
  // needs a runtime transformation pipeline. The module pulled sharp + ipx into
  // the server bundle — 18.5 MB of a 29 MB output — for a feature with zero
  // consumers, which only slowed cold starts on Vercel.
  // Re-add it (and swap `<ProductImage>` back to `<NuxtImg>`) when real
  // photography replaces the illustrations. See TODO.md → "Katalog & konten".
  icon: {
    mode: 'svg',
    class: 'pk-icon',
    size: '1.25em',
    // The collection is pinned explicitly. Left on `auto`, the server bundle
    // failed to resolve every `ph:*` name and SSR emitted empty `<svg>` tags —
    // icons only appeared after client hydration, which meant a visible pop-in
    // and no icons at all without JS.
    serverBundle: {
      collections: ['ph'],
    },
    // Inlines every icon used in the source so none is fetched at runtime.
    //
    // `globInclude` is overridden on purpose: the scanner skips plain .ts files
    // by default, and several icon names are only referenced through constant
    // maps (`app/constants/navigation.ts`, `app/composables/useAllergens.ts`).
    // Without .ts in the scan those icons resolved to empty `<svg>` tags during
    // SSR and only appeared after hydration.
    clientBundle: {
      scan: {
        globInclude: ['app/**/*.{vue,ts}'],
      },
      sizeLimitKb: 320,
    },
  },

  fonts: {
    families: [
      { name: 'Fraunces', provider: 'google', weights: [400, 500, 600, 700], styles: ['normal', 'italic'] },
      { name: 'Plus Jakarta Sans', provider: 'google', weights: [400, 500, 600, 700, 800] },
    ],
    defaults: {
      preload: true,
    },
  },

  // ── SEO ────────────────────────────────────────────────────────────────────
  sitemap: {
    autoI18n: true,
    exclude: ['/checkout/**'],
  },

  robots: {
    // `autoI18n` is disabled and every localized path is listed by hand.
    // Left on, the module rewrote the list into `/en/cart` twice while dropping
    // the Indonesian `/keranjang` and `/checkout` entirely — the exact routes
    // that most needed excluding.
    autoI18n: false,
    disallow: [
      '/keranjang',
      '/checkout',
      '/checkout/',
      '/en/cart',
      '/en/checkout',
      '/en/checkout/',
    ],
  },

  schemaOrg: {
    identity: {
      type: 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      // Raster, not the SVG mark: Google's structured-data logo field and
      // social crawlers both want a bitmap.
      logo: `${SITE_URL}/icon-512.png`,
    },
  },

  // ── Build ──────────────────────────────────────────────────────────────────
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
          loadPaths: [fileURLToPath(new URL('./app/assets/scss', import.meta.url))],
        },
      },
    },
  },

  nitro: {
    compressPublicAssets: { gzip: true, brotli: true },
    prerender: {
      crawlLinks: true,
      routes: ['/', '/en'],
    },
  },

  eslint: {
    config: {
      stylistic: true,
    },
  },

  typescript: {
    strict: true,
    typeCheck: false,
  },
})
