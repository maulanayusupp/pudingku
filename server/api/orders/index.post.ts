import { findProductBySlug, resolveLocale } from '../../services/catalog.repository'
import { PRICING, deliveryFeeFor, orderTotal } from '../../services/pricing'
import { generateReference } from '#shared/utils/reference'
import type { OrderInput, OrderLine, OrderSummary } from '#shared/types/order'

/**
 * POST /api/orders — DEMO ONLY.
 *
 * The handler validates the payload and computes an authoritative total from
 * server-side prices (a client-supplied price is never trusted), then returns a
 * summary. It does NOT persist the order, charge anyone, or notify anybody.
 * The UI and `/kepatuhan` state this plainly; do not remove those notices until
 * a real gateway and datastore are connected.
 */
export default defineEventHandler(async (event): Promise<OrderSummary> => {
  const body = await readBody<Partial<OrderInput>>(event)
  const locale = resolveLocale(String(getQuery(event).locale ?? ''))
  const fields: Record<string, string> = {}

  const name = body?.name?.trim() ?? ''
  const email = body?.email?.trim() ?? ''
  const phone = body?.phone?.trim() ?? ''
  const method = body?.method === 'delivery' ? 'delivery' : 'pickup'

  if (name.length < 2) fields.name = 'validation.required'
  if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(email)) fields.email = 'validation.email'
  if (phone.replace(/\D/g, '').length < 9) fields.phone = 'validation.phone'

  if (method === 'delivery') {
    if (!body?.address?.trim()) fields.address = 'validation.required'
    if (!body?.city?.trim()) fields.city = 'validation.required'
  }

  const rawItems = Array.isArray(body?.items) ? body.items : []
  if (rawItems.length === 0) fields.items = 'validation.cartEmpty'
  if (rawItems.length > PRICING.maxLinesPerOrder) fields.items = 'validation.cartTooLarge'

  const lines: OrderLine[] = []

  for (const item of rawItems) {
    const product = findProductBySlug(String(item?.slug ?? ''), locale)
    if (!product || !product.available) {
      fields.items = 'validation.itemUnavailable'
      continue
    }

    const quantity = Math.trunc(Number(item?.quantity ?? 0))
    if (!Number.isFinite(quantity) || quantity < 1 || quantity > PRICING.maxQuantityPerLine) {
      fields.items = 'validation.quantity'
      continue
    }

    lines.push({
      slug: product.slug,
      name: product.name,
      quantity,
      unitPriceIdr: product.priceIdr,
      subtotalIdr: product.priceIdr * quantity,
    })
  }

  if (Object.keys(fields).length > 0 || lines.length === 0) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Validation failed',
      data: { message: 'validation.formHasErrors', fields },
    })
  }

  const subtotalIdr = lines.reduce((total, line) => total + line.subtotalIdr, 0)
  const deliveryFeeIdr = deliveryFeeFor(method, subtotalIdr)

  return {
    reference: generateReference('PKU'),
    createdAt: new Date().toISOString(),
    lines,
    itemCount: lines.reduce((total, line) => total + line.quantity, 0),
    subtotalIdr,
    deliveryFeeIdr,
    totalIdr: orderTotal(subtotalIdr, deliveryFeeIdr),
    method,
    status: 'demo',
    customerName: name,
    customerEmail: email,
  }
})
