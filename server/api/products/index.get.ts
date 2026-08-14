import { findProducts, resolveLocale } from '../../services/catalog.repository'
import type { ProductCategory, ProductListResponse, ProductSort } from '#shared/types/catalog'

const SORTS: ProductSort[] = ['featured', 'price-asc', 'price-desc', 'name-asc']
const CATEGORIES: (ProductCategory | 'all')[] = ['all', 'pudding', 'cake']

/**
 * GET /api/products
 * Query: locale, category, q, sort, badge, limit
 *
 * Unknown values fall back to safe defaults rather than erroring, so a stale
 * bookmark or a hand-edited URL never breaks the shop page.
 */
export default defineCachedEventHandler(async (event): Promise<ProductListResponse> => {
  const query = getQuery(event)

  const locale = resolveLocale(typeof query.locale === 'string' ? query.locale : undefined)
  const category = CATEGORIES.includes(query.category as ProductCategory)
    ? (query.category as ProductCategory | 'all')
    : 'all'
  const sort = SORTS.includes(query.sort as ProductSort) ? (query.sort as ProductSort) : 'featured'
  const limitRaw = Number.parseInt(String(query.limit ?? ''), 10)

  const items = findProducts({
    locale,
    category,
    sort,
    q: typeof query.q === 'string' ? query.q : undefined,
    badge: typeof query.badge === 'string' ? (query.badge as never) : undefined,
    limit: Number.isFinite(limitRaw) ? limitRaw : undefined,
  })

  return { items, total: items.length, locale }
}, {
  // The catalog is static in this build; cache per unique query string.
  maxAge: 60 * 10,
  name: 'products-list',
  getKey: event => getRequestURL(event).search || 'default',
})
