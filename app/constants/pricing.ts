/**
 * Client-side mirror of `server/services/pricing.ts`.
 *
 * The cart shows an estimated total before the order is submitted; the server
 * still recomputes everything authoritatively. If you change one file, change
 * the other — the values are asserted against each other in the checkout page,
 * which always displays the server total once the order is created.
 */
export const PRICING_CLIENT = {
  deliveryFeeIdr: 20000,
  freeDeliveryThresholdIdr: 300000,
  maxQuantityPerLine: 20,
} as const
