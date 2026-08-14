import { allProductSlugs } from '../../services/catalog.repository'

/**
 * Dynamic sitemap source for product detail pages.
 * `@nuxtjs/sitemap` is configured with `autoI18n`, so each URL listed here is
 * expanded into its `id` and `en` variants with the right alternates.
 */
export default defineSitemapEventHandler(() =>
  allProductSlugs().map(slug => ({
    loc: `/produk/${slug}`,
    changefreq: 'weekly' as const,
    priority: 0.8,
  })),
)
