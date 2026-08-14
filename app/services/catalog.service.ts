import { cleanQuery, request } from './http'
import type {
  CategorySummary,
  Product,
  ProductListResponse,
  ProductQuery,
} from '#shared/types/catalog'

/**
 * Read-only catalog access. Components never call `/api/...` directly — they go
 * through this service so the endpoint shape can change in one place.
 */

export interface ProductDetail {
  product: Product
  related: Product[]
}

export const catalogService = {
  /** Paginated-free list; the catalog is small enough to send whole. */
  list(query: ProductQuery = {}): Promise<ProductListResponse> {
    return request<ProductListResponse>('/api/products', {
      query: cleanQuery({
        locale: query.locale,
        category: query.category,
        q: query.q,
        sort: query.sort,
        badge: query.badge,
        limit: query.limit,
      }),
    })
  },

  /** Product page payload: the item plus its related list. */
  detail(slug: string, locale?: string): Promise<ProductDetail> {
    return request<ProductDetail>(`/api/products/${encodeURIComponent(slug)}`, {
      query: cleanQuery({ locale }),
    })
  },

  /** Counts and price ranges per category. */
  categories(locale?: string): Promise<{ categories: CategorySummary[] }> {
    return request<{ categories: CategorySummary[] }>('/api/categories', {
      query: cleanQuery({ locale }),
    })
  },
}
