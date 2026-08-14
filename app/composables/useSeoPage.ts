/**
 * Page-level SEO in one call.
 *
 * Handles the things every page needs and that are easy to forget:
 *  1. localized `<title>` / `<meta description>`
 *  2. canonical URL built from the runtime site URL (not the request host, so a
 *     preview deploy never publishes itself as canonical)
 *  3. a complete Open Graph image block — URL, secure URL, dimensions and MIME
 *     type. WhatsApp in particular will show a preview with no picture when the
 *     dimensions are missing, and it cannot render SVG at all, which is why
 *     every card is a pre-rendered 1200×630 JPEG under `public/og/`.
 *  4. Twitter cards
 *  5. `hreflang` alternates — supplied by `@nuxtjs/i18n`'s `useLocaleHead`
 */

/** Every share card is generated at this size by `scripts/generate-og-images.mjs`. */
const OG_WIDTH = 1200
const OG_HEIGHT = 630
const OG_TYPE = 'image/jpeg'

export interface SeoPageOptions {
  title: string
  description: string
  /**
   * Root-relative path to a raster share card, or an absolute URL.
   * Leave unset to use the brand card for the active locale.
   * Never point this at an SVG — social crawlers cannot render one.
   */
  image?: string
  /** `article` for long-form pages, `product` for product detail. */
  type?: 'website' | 'article' | 'product'
  /** Set to true on pages that must never be indexed (cart, checkout). */
  noindex?: boolean
}

export function useSeoPage(options: MaybeRefOrGetter<SeoPageOptions>) {
  const config = useRuntimeConfig()
  const route = useRoute()
  const { locale, locales } = useI18n()
  const localeHead = useLocaleHead({ lang: true, dir: true, seo: true })

  const siteUrl = String(config.public.siteUrl).replace(/\/$/, '')
  const resolved = computed(() => toValue(options))

  const canonical = computed(() => `${siteUrl}${route.path === '/' ? '' : route.path}`)

  const imageUrl = computed(() => {
    const image = resolved.value.image ?? `/og/pudingku-og.${locale.value}.jpg`
    return image.startsWith('http') ? image : `${siteUrl}${image}`
  })

  const localeTags = computed(() =>
    (locales.value as { code: string, language?: string }[]).map(item => ({
      code: item.code,
      tag: (item.language ?? 'id-ID').replace('-', '_'),
    })),
  )

  const currentLocaleTag = computed(
    () => localeTags.value.find(item => item.code === locale.value)?.tag ?? 'id_ID',
  )

  const alternateLocaleTags = computed(() =>
    localeTags.value.filter(item => item.code !== locale.value).map(item => item.tag),
  )

  useHead(() => ({
    htmlAttrs: localeHead.value.htmlAttrs,
    link: [
      { rel: 'canonical', href: canonical.value },
      ...(localeHead.value.link ?? []),
    ],
    meta: [
      ...(localeHead.value.meta ?? []),
    ],
  }))

  useSeoMeta({
    title: () => resolved.value.title,
    description: () => resolved.value.description,
    robots: () => (resolved.value.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'),

    ogTitle: () => resolved.value.title,
    ogDescription: () => resolved.value.description,
    ogType: () => (resolved.value.type ?? 'website') as 'website',
    ogUrl: () => canonical.value,
    ogSiteName: () => String(config.public.siteName),
    ogLocale: () => currentLocaleTag.value,
    ogLocaleAlternate: () => alternateLocaleTags.value,

    // The full image block. `secureUrl`, `width`, `height` and `type` are what
    // make the preview render reliably on WhatsApp and Facebook rather than
    // falling back to a text-only card.
    ogImage: () => imageUrl.value,
    ogImageSecureUrl: () => imageUrl.value,
    ogImageWidth: OG_WIDTH,
    ogImageHeight: OG_HEIGHT,
    ogImageType: OG_TYPE,
    ogImageAlt: () => resolved.value.title,

    twitterCard: 'summary_large_image',
    twitterTitle: () => resolved.value.title,
    twitterDescription: () => resolved.value.description,
    twitterImage: () => imageUrl.value,
    twitterImageAlt: () => resolved.value.title,
  })

  return { canonical, imageUrl }
}
