import { resolveLocale, summarizeCategories } from '../services/catalog.repository'
import type { CategorySummary } from '#shared/types/catalog'

/**
 * GET /api/categories
 * Counts and price ranges per category, used by the shop filter bar and the
 * home page category cards.
 */
export default defineCachedEventHandler(async (event): Promise<{ categories: CategorySummary[] }> => {
  const locale = resolveLocale(String(getQuery(event).locale ?? ''))
  return { categories: summarizeCategories(locale) }
}, {
  maxAge: 60 * 30,
  name: 'categories',
  getKey: event => String(getQuery(event).locale ?? 'id'),
})
