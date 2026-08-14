import { findProductBySlug, findRelated, resolveLocale } from '../../services/catalog.repository'
import type { Product } from '#shared/types/catalog'

export interface ProductDetailResponse {
  product: Product
  related: Product[]
}

/**
 * GET /api/products/:slug
 * Returns the product plus a short related list so the detail page needs a
 * single request.
 */
export default defineEventHandler(async (event): Promise<ProductDetailResponse> => {
  const slug = getRouterParam(event, 'slug')
  const locale = resolveLocale(String(getQuery(event).locale ?? ''))

  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing product slug' })
  }

  const product = findProductBySlug(slug, locale)

  if (!product) {
    throw createError({ statusCode: 404, statusMessage: 'Product not found' })
  }

  return { product, related: findRelated(slug, locale, 4) }
})
