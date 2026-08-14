import type { FulfilmentMethod } from '#shared/types/order'

/**
 * Order pricing rules.
 *
 * These figures are placeholders chosen so the demo checkout adds up
 * consistently — they are NOT a published tariff. Replace them with the real
 * courier rates before launch (TODO.md → "Ongkir & pembayaran").
 */

export const PRICING = {
  /** Flat inner-city delivery fee used by the demo checkout. */
  deliveryFeeIdr: 20000,
  /** Orders at or above this subtotal skip the delivery fee. */
  freeDeliveryThresholdIdr: 300000,
  /** Hard cap so a malformed request cannot create an absurd order. */
  maxQuantityPerLine: 20,
  maxLinesPerOrder: 30,
} as const

export function deliveryFeeFor(method: FulfilmentMethod, subtotalIdr: number): number {
  if (method === 'pickup') return 0
  return subtotalIdr >= PRICING.freeDeliveryThresholdIdr ? 0 : PRICING.deliveryFeeIdr
}

export const orderTotal = (subtotalIdr: number, deliveryFeeIdr: number): number =>
  subtotalIdr + deliveryFeeIdr
