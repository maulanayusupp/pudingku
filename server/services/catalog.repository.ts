import { productRecords } from '../data/products'
import type {
  CategorySummary,
  LocaleCode,
  Product,
  ProductCategory,
  ProductQuery,
  ProductRecord,
  ProductSort,
} from '#shared/types/catalog'

/**
 * Catalog repository — the boundary between "where products live" and the HTTP
 * layer. Today it reads a static module; swapping in Postgres, Sanity or Shopify
 * means reimplementing only this file.
 */

const SUPPORTED_LOCALES: LocaleCode[] = ['id', 'en']

export const resolveLocale = (input?: string): LocaleCode =>
  SUPPORTED_LOCALES.includes(input as LocaleCode) ? (input as LocaleCode) : 'id'

/** Collapse a multi-locale record down to one locale. */
function localize(record: ProductRecord, locale: LocaleCode): Product {
  return {
    id: record.id,
    slug: record.slug,
    category: record.category,
    name: record.name[locale],
    tagline: record.tagline[locale],
    description: record.description[locale],
    highlights: record.highlights[locale],
    ingredients: record.ingredients[locale],
    storage: record.storage[locale],
    unit: record.unit[locale],
    priceIdr: record.priceIdr,
    compareAtPriceIdr: record.compareAtPriceIdr,
    servings: record.servings,
    netWeightGram: record.netWeightGram,
    allergens: record.allergens,
    badges: record.badges,
    accent: record.accent,
    accentSoft: record.accentSoft,
    image: record.image,
    leadTimeHours: record.leadTimeHours,
    available: record.available,
    order: record.order,
  }
}

/** Category order used by the `featured` sort: pudding is the hero line. */
const CATEGORY_WEIGHT: Record<ProductCategory, number> = { pudding: 0, cake: 1 }

function compare(sort: ProductSort) {
  return (a: Product, b: Product): number => {
    switch (sort) {
      case 'price-asc':
        return a.priceIdr - b.priceIdr
      case 'price-desc':
        return b.priceIdr - a.priceIdr
      case 'name-asc':
        return a.name.localeCompare(b.name)
      case 'featured':
      default:
        return (
          CATEGORY_WEIGHT[a.category] - CATEGORY_WEIGHT[b.category]
          || a.order - b.order
        )
    }
  }
}

export function findProducts(query: ProductQuery = {}): Product[] {
  const locale = resolveLocale(query.locale)
  const term = query.q?.trim().toLowerCase() ?? ''

  let items = productRecords.map(record => localize(record, locale))

  if (query.category && query.category !== 'all') {
    items = items.filter(item => item.category === query.category)
  }

  if (query.badge) {
    items = items.filter(item => item.badges.includes(query.badge!))
  }

  if (term) {
    items = items.filter(item =>
      item.name.toLowerCase().includes(term)
      || item.tagline.toLowerCase().includes(term)
      || item.ingredients.some(ingredient => ingredient.toLowerCase().includes(term)),
    )
  }

  items.sort(compare(query.sort ?? 'featured'))

  return typeof query.limit === 'number' && query.limit > 0 ? items.slice(0, query.limit) : items
}

export function findProductBySlug(slug: string, locale?: string): Product | null {
  const record = productRecords.find(item => item.slug === slug)
  return record ? localize(record, resolveLocale(locale)) : null
}

/**
 * Products shown as "you might also like": same category first, then the rest,
 * never including the product itself.
 */
export function findRelated(slug: string, locale?: string, limit = 4): Product[] {
  const resolved = resolveLocale(locale)
  const current = productRecords.find(item => item.slug === slug)
  if (!current) return []

  const others = productRecords
    .filter(item => item.slug !== slug && item.available)
    .map(item => localize(item, resolved))
    .sort((a, b) => {
      const aSame = a.category === current.category ? 0 : 1
      const bSame = b.category === current.category ? 0 : 1
      return aSame - bSame || a.order - b.order
    })

  return others.slice(0, limit)
}

export function summarizeCategories(locale?: string): CategorySummary[] {
  const items = findProducts({ locale: resolveLocale(locale), category: 'all' })
  const categories: ProductCategory[] = ['pudding', 'cake']

  return categories.map((key) => {
    const scoped = items.filter(item => item.category === key)
    const prices = scoped.map(item => item.priceIdr)
    return {
      key,
      count: scoped.length,
      minPriceIdr: prices.length ? Math.min(...prices) : 0,
      maxPriceIdr: prices.length ? Math.max(...prices) : 0,
    }
  })
}

/** Slugs only — used by the sitemap source. */
export const allProductSlugs = (): string[] => productRecords.map(item => item.slug)

/** Price lookup for order totals; never trusts a price sent by the client. */
export function priceOf(slug: string): number | null {
  return productRecords.find(item => item.slug === slug)?.priceIdr ?? null
}
