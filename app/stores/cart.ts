import { defineStore } from 'pinia'
import { PRICING_CLIENT } from '~/constants/pricing'
import { STORAGE_KEYS, readJson, writeJson } from '~/utils/storage'
import type { Product } from '#shared/types/catalog'

/**
 * Cart store.
 *
 * Only the identity and quantity of a line are persisted. Price, name and image
 * are re-read from the catalog on every render, so a price change on the server
 * can never be overridden by a stale value sitting in a visitor's localStorage.
 */

export interface CartLine {
  slug: string
  quantity: number
  /** Snapshot for offline rendering; the server recomputes the real price. */
  name: string
  priceIdr: number
  image: string
  accent: string
  unit: string
}

interface PersistedCart {
  version: 1
  lines: Pick<CartLine, 'slug' | 'quantity'>[]
}

export const useCartStore = defineStore('cart', () => {
  const lines = ref<CartLine[]>([])
  const isDrawerOpen = ref(false)
  /** Slug of the item most recently added — drives the "added" toast. */
  const lastAddedSlug = ref<string | null>(null)
  const isHydrated = ref(false)

  // ── Getters ────────────────────────────────────────────────────────────────
  const itemCount = computed(() =>
    lines.value.reduce((total, line) => total + line.quantity, 0),
  )

  const isEmpty = computed(() => lines.value.length === 0)

  const subtotalIdr = computed(() =>
    lines.value.reduce((total, line) => total + line.priceIdr * line.quantity, 0),
  )

  const deliveryFeeIdr = computed(() =>
    subtotalIdr.value >= PRICING_CLIENT.freeDeliveryThresholdIdr
      ? 0
      : PRICING_CLIENT.deliveryFeeIdr,
  )

  /** How much more is needed to reach free delivery; `0` once reached. */
  const amountToFreeDeliveryIdr = computed(() =>
    Math.max(0, PRICING_CLIENT.freeDeliveryThresholdIdr - subtotalIdr.value),
  )

  const freeDeliveryProgress = computed(() =>
    Math.min(1, subtotalIdr.value / PRICING_CLIENT.freeDeliveryThresholdIdr),
  )

  const quantityOf = (slug: string): number =>
    lines.value.find(line => line.slug === slug)?.quantity ?? 0

  // ── Actions ────────────────────────────────────────────────────────────────
  function add(product: Product, quantity = 1): void {
    const existing = lines.value.find(line => line.slug === product.slug)
    const next = Math.min(
      PRICING_CLIENT.maxQuantityPerLine,
      (existing?.quantity ?? 0) + Math.max(1, quantity),
    )

    if (existing) {
      existing.quantity = next
    } else {
      lines.value.push({
        slug: product.slug,
        quantity: next,
        name: product.name,
        priceIdr: product.priceIdr,
        image: product.image,
        accent: product.accent,
        unit: product.unit,
      })
    }

    lastAddedSlug.value = product.slug
    persist()
  }

  function setQuantity(slug: string, quantity: number): void {
    const line = lines.value.find(item => item.slug === slug)
    if (!line) return

    const next = Math.trunc(quantity)
    if (next < 1) {
      remove(slug)
      return
    }

    line.quantity = Math.min(PRICING_CLIENT.maxQuantityPerLine, next)
    persist()
  }

  const increment = (slug: string) => setQuantity(slug, quantityOf(slug) + 1)
  const decrement = (slug: string) => setQuantity(slug, quantityOf(slug) - 1)

  function remove(slug: string): void {
    lines.value = lines.value.filter(line => line.slug !== slug)
    persist()
  }

  function clear(): void {
    lines.value = []
    lastAddedSlug.value = null
    persist()
  }

  const openDrawer = () => { isDrawerOpen.value = true }
  const closeDrawer = () => { isDrawerOpen.value = false }
  const toggleDrawer = () => { isDrawerOpen.value = !isDrawerOpen.value }

  // ── Persistence ────────────────────────────────────────────────────────────
  function persist(): void {
    if (!isHydrated.value) return
    const payload: PersistedCart = {
      version: 1,
      lines: lines.value.map(({ slug, quantity }) => ({ slug, quantity })),
    }
    writeJson(STORAGE_KEYS.cart, payload)
  }

  /**
   * Restores quantities from storage and re-attaches fresh catalog data.
   * Called once from `plugins/cart.client.ts`, after the catalog is available.
   */
  function hydrate(catalog: Product[]): void {
    const stored = readJson<PersistedCart | null>(STORAGE_KEYS.cart, null)
    isHydrated.value = true

    if (!stored || stored.version !== 1) return

    lines.value = stored.lines
      .map((entry) => {
        const product = catalog.find(item => item.slug === entry.slug)
        if (!product || !product.available) return null
        return {
          slug: product.slug,
          quantity: Math.min(PRICING_CLIENT.maxQuantityPerLine, Math.max(1, entry.quantity)),
          name: product.name,
          priceIdr: product.priceIdr,
          image: product.image,
          accent: product.accent,
          unit: product.unit,
        } satisfies CartLine
      })
      .filter((line): line is CartLine => line !== null)

    // Drop lines that no longer exist so storage stops carrying dead slugs.
    persist()
  }

  /** Re-labels lines after a language switch without touching quantities. */
  function relabel(catalog: Product[]): void {
    for (const line of lines.value) {
      const product = catalog.find(item => item.slug === line.slug)
      if (!product) continue
      line.name = product.name
      line.unit = product.unit
      line.priceIdr = product.priceIdr
    }
  }

  return {
    lines,
    isDrawerOpen,
    lastAddedSlug,
    isHydrated,
    itemCount,
    isEmpty,
    subtotalIdr,
    deliveryFeeIdr,
    amountToFreeDeliveryIdr,
    freeDeliveryProgress,
    quantityOf,
    add,
    setQuantity,
    increment,
    decrement,
    remove,
    clear,
    openDrawer,
    closeDrawer,
    toggleDrawer,
    hydrate,
    relabel,
  }
})
