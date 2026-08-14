import { cleanQuery, request } from './http'
import type { OrderInput, OrderSummary } from '#shared/types/order'

/**
 * Order submission.
 *
 * IMPORTANT: `/api/orders` is a demo endpoint — it validates and prices the
 * order but does not persist or charge anything. `runtimeConfig.public.checkoutIsDemo`
 * gates the notice the checkout page shows; keep them in sync.
 */
export const orderService = {
  create(payload: OrderInput, locale?: string): Promise<OrderSummary> {
    return request<OrderSummary>('/api/orders', {
      method: 'POST',
      body: payload,
      query: cleanQuery({ locale }),
    })
  },
}
