/**
 * Page-level SEO in one call.
 *
 * Handles the four things every page needs and that are easy to forget:
 *  1. localized `<title>` / `<meta description>`
 *  2. canonical URL built from the runtime site URL (not the request host, so a
 *     preview deploy never publishes itself as canonical)
 *  3. Open Graph + Twitter cards
 *  4. `hreflang` alternates — supplied by `@nuxtjs/i18n`'s `useLocaleHead`
 */

export interface SeoPageOptions {
  title: string
  description: string
  /** Absolute or root-relative image path. Falls back to the brand OG image. */
  image?: string
  /** `article` for blog-style pages, `product` for product detail. */
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
    const image = resolved.value.image ?? '/og/pudingku-og.png'
    return image.startsWith('http') ? image : `${siteUrl}${image}`
  })

  const localeTag = computed(() => {
    const match = (locales.value as { code: string, language?: string }[])
      .find(item => item.code === locale.value)
    return match?.language ?? 'id-ID'
  })

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
    ogImage: () => imageUrl.value,
    ogImageAlt: () => resolved.value.title,
    ogSiteName: () => String(config.public.siteName),
    ogLocale: () => localeTag.value.replace('-', '_'),

    twitterCard: 'summary_large_image',
    twitterTitle: () => resolved.value.title,
    twitterDescription: () => resolved.value.description,
    twitterImage: () => imageUrl.value,
  })

  return { canonical, imageUrl }
}
