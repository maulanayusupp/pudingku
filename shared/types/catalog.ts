/**
 * Catalog domain types shared between the Nitro server routes and the Nuxt app.
 * Product copy is stored per locale so the API can serve a single localized
 * payload without a second round-trip.
 */

export type LocaleCode = 'id' | 'en'

/** A string that exists in every supported locale. */
export type Localized<T = string> = Record<LocaleCode, T>

export type ProductCategory = 'pudding' | 'cake'

export type AllergenCode = 'dairy' | 'egg' | 'gluten' | 'nut' | 'soy' | 'coconut' | 'sesame'

export type ProductBadge = 'signature' | 'new' | 'bestseller-internal' | 'seasonal' | 'egg-free' | 'gluten-free'

/** Raw record as stored in the data layer (all locales present). */
export interface ProductRecord {
  id: string
  slug: string
  category: ProductCategory
  name: Localized
  tagline: Localized
  description: Localized
  /** Short bullet points shown on the product detail page. */
  highlights: Localized<string[]>
  ingredients: Localized<string[]>
  storage: Localized
  /** Selling unit, e.g. "cup 180 ml" / "loyang 20 cm". */
  unit: Localized
  priceIdr: number
  /** Optional strike-through price. Only set when a real promo exists. */
  compareAtPriceIdr?: number
  servings: number
  netWeightGram: number
  allergens: AllergenCode[]
  badges: ProductBadge[]
  /** Hex accent colour used by cards, chips and gradients. */
  accent: string
  /** Secondary hex colour for gradients. */
  accentSoft: string
  image: string
  /** Hours needed to prepare the item after an order is confirmed. */
  leadTimeHours: number
  available: boolean
  /** Lower number sorts first inside its category. */
  order: number
}

/** Localized product as returned by the API for a given locale. */
export interface Product {
  id: string
  slug: string
  category: ProductCategory
  name: string
  tagline: string
  description: string
  highlights: string[]
  ingredients: string[]
  storage: string
  unit: string
  priceIdr: number
  compareAtPriceIdr?: number
  servings: number
  netWeightGram: number
  allergens: AllergenCode[]
  badges: ProductBadge[]
  accent: string
  accentSoft: string
  image: string
  leadTimeHours: number
  available: boolean
  order: number
}

export interface ProductQuery {
  locale?: LocaleCode
  category?: ProductCategory | 'all'
  /** Free-text search across name and tagline. */
  q?: string
  sort?: ProductSort
  badge?: ProductBadge
  limit?: number
}

export type ProductSort = 'featured' | 'price-asc' | 'price-desc' | 'name-asc'

export interface ProductListResponse {
  items: Product[]
  total: number
  locale: LocaleCode
}

export interface CategorySummary {
  key: ProductCategory
  count: number
  minPriceIdr: number
  maxPriceIdr: number
}
