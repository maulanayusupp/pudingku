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

const SITE_URL = process.env.NUXT_PUBLIC_SITE_URL || 'https://pudingku.id'
const SITE_NAME = 'Pudingku'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  future: {
    compatibilityVersion: 4,
  },

  devtools: { enabled: true },

  modules: [
    '@nuxtjs/i18n',
    '@nuxt/image',
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
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'pk_locale',
      cookieCrossOrigin: false,
      redirectOn: 'root',
      alwaysRedirect: false,
      fallbackLocale: 'id',
    },
    bundle: {
      optimizeTranslationDirective: false,
    },
    // Localised URLs: Indonesian visitors get Indonesian slugs, which is the
    // primary market. Page keys map to files under `app/pages`.
    customRoutes: 'config',
    pages: {
      products: { id: '/produk', en: '/products' },
      'products-slug': { id: '/produk/[slug]', en: '/products/[slug]' },
      cart: { id: '/keranjang', en: '/cart' },
      checkout: { id: '/checkout', en: '/checkout' },
      'checkout-success': { id: '/checkout/berhasil', en: '/checkout/success' },
      about: { id: '/tentang', en: '/about' },
      contact: { id: '/kontak', en: '/contact' },
      faq: { id: '/tanya-jawab', en: '/faq' },
      compliance: { id: '/kepatuhan', en: '/compliance' },
      'compliance-doc': { id: '/kepatuhan/[doc]', en: '/compliance/[doc]' },
    },
  },

  // ── Assets ─────────────────────────────────────────────────────────────────
  image: {
    // Product art ships as SVG, which needs no transformation pipeline; the
    // module is kept for raster art (OG images, future photography).
    quality: 78,
    format: ['webp', 'jpeg'],
    screens: {
      xs: 360,
      sm: 576,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
  },

  icon: {
    mode: 'svg',
    class: 'pk-icon',
    size: '1.25em',
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
    disallow: ['/checkout', '/checkout/*', '/keranjang', '/cart'],
  },

  schemaOrg: {
    identity: {
      type: 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/brand/logo-mark.svg`,
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
