/**
 * Order & contact domain types.
 *
 * NOTE: this project ships a demo checkout. No payment gateway is connected and
 * no order is persisted beyond the running server process. The checkout UI and
 * the compliance pages state this explicitly so no visitor is misled.
 */

export type FulfilmentMethod = 'pickup' | 'delivery'

export interface CartLineInput {
  slug: string
  quantity: number
}

export interface OrderCustomerInput {
  name: string
  email: string
  phone: string
  method: FulfilmentMethod
  /** Required when `method === 'delivery'`. */
  address?: string
  city?: string
  postalCode?: string
  /** ISO date (YYYY-MM-DD) the customer wants the order ready. */
  preferredDate?: string
  note?: string
}

export interface OrderInput extends OrderCustomerInput {
  items: CartLineInput[]
}

export interface OrderLine {
  slug: string
  name: string
  quantity: number
  unitPriceIdr: number
  subtotalIdr: number
}

export interface OrderSummary {
  /** Human friendly reference, e.g. PKU-8F3K2Q. */
  reference: string
  createdAt: string
  lines: OrderLine[]
  itemCount: number
  subtotalIdr: number
  deliveryFeeIdr: number
  totalIdr: number
  method: FulfilmentMethod
  /** Always `demo` in this build — there is no payment integration. */
  status: 'demo'
  customerName: string
  customerEmail: string
}

export interface ContactInput {
  name: string
  email: string
  subject: string
  message: string
}

export interface ContactResult {
  reference: string
  receivedAt: string
  /** Always `queued-demo`: the message is validated but not delivered anywhere. */
  status: 'queued-demo'
}

export interface ApiError {
  message: string
  /** Field-level messages keyed by input name. */
  fields?: Record<string, string>
}
