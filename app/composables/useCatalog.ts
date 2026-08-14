import { catalogService } from '~/services/catalog.service'
import type { LocaleCode, Product, ProductCategory, ProductSort } from '#shared/types/catalog'

/**
 * Catalog data access for pages and components.
 *
 * Everything goes through `useAsyncData` with a locale-aware key so switching
 * language refetches the localized copy, and so the payload is serialised into
 * the SSR response instead of being fetched twice.
 */

export interface CatalogFilters {
  category: ProductCategory | 'all'
  q: string
  sort: ProductSort
}

/** Full product list for the shop page, reactive to filters and locale. */
export function useProductList(filters?: Ref<CatalogFilters>) {
  const { locale } = useI18n()

  const key = computed(() => {
    const f = filters?.value
    return `products:${locale.value}:${f?.category ?? 'all'}:${f?.sort ?? 'featured'}:${f?.q ?? ''}`
  })

  return useAsyncData(
    key,
    () => catalogService.list({
      locale: locale.value as LocaleCode,
      category: filters?.value.category,
      sort: filters?.value.sort,
      q: filters?.value.q,
    }),
    {
      watch: filters ? [filters, locale] : [locale],
      default: () => ({ items: [] as Product[], total: 0, locale: locale.value as LocaleCode }),
    },
  )
}

/** A short list used by home-page rails. */
export function useProductRail(options: { badge?: string, category?: ProductCategory, limit?: number, key: string }) {
  const { locale } = useI18n()

  return useAsyncData(
    () => `rail:${options.key}:${locale.value}`,
    () => catalogService.list({
      locale: locale.value as LocaleCode,
      badge: options.badge as never,
      category: options.category,
      limit: options.limit,
    }),
    {
      watch: [locale],
      default: () => ({ items: [] as Product[], total: 0, locale: locale.value as LocaleCode }),
    },
  )
}

/** Product detail + related items. Throws a 404 page when the slug is unknown. */
export function useProductDetail(slug: Ref<string> | string) {
  const { locale } = useI18n()
  const resolved = computed(() => (typeof slug === 'string' ? slug : slug.value))

  return useAsyncData(
    () => `product:${resolved.value}:${locale.value}`,
    () => catalogService.detail(resolved.value, locale.value),
    { watch: [locale, resolved] },
  )
}

/** Category counts + price ranges. */
export function useCategorySummary() {
  const { locale } = useI18n()

  return useAsyncData(
    () => `categories:${locale.value}`,
    () => catalogService.categories(locale.value),
    { watch: [locale], default: () => ({ categories: [] }) },
  )
}
