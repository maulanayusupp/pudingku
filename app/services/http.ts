import type { FetchOptions } from 'ofetch'
import type { ApiError } from '#shared/types/order'

/**
 * Thin HTTP layer shared by every service.
 *
 * Its one job is to turn whatever the network throws at us into a predictable
 * `ApiError` carrying translation KEYS, so components never have to inspect
 * status codes or provider-specific error shapes.
 *
 * Services are imported explicitly (`~/services/...`) rather than auto-imported:
 * an explicit import makes the dependency obvious in review and keeps the
 * auto-import namespace reserved for composables and pure helpers.
 */

export class HttpError extends Error implements ApiError {
  readonly statusCode: number
  readonly fields?: Record<string, string>

  constructor(message: string, statusCode: number, fields?: Record<string, string>) {
    super(message)
    this.name = 'HttpError'
    this.statusCode = statusCode
    this.fields = fields
  }
}

interface ErrorPayload {
  statusCode?: number
  data?: {
    message?: string
    fields?: Record<string, string>
    data?: { message?: string, fields?: Record<string, string> }
  }
}

function toHttpError(error: unknown): HttpError {
  const source = error as ErrorPayload
  const status = source?.statusCode ?? 500
  // Nitro nests `createError({ data })` one level deeper on the client.
  const payload = source?.data?.data ?? source?.data

  if (status === 422 && payload?.fields) {
    return new HttpError(payload.message ?? 'errors.validation', status, payload.fields)
  }

  if (status === 404) return new HttpError('errors.notFound', status)
  if (status >= 500) return new HttpError('errors.server', status)

  return new HttpError(payload?.message ?? 'errors.unknown', status)
}

/** `$fetch` with normalised errors. */
export async function request<T>(url: string, options: FetchOptions = {}): Promise<T> {
  try {
    return await $fetch<T>(url, options as never)
  } catch (error) {
    throw toHttpError(error)
  }
}

/**
 * Strips `undefined` and empty-string values so they never end up in the query
 * string as `?q=&sort=`, which would fragment the server-side cache key.
 */
export function cleanQuery(input: Record<string, unknown>): Record<string, string> {
  return Object.entries(input).reduce<Record<string, string>>((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') acc[key] = String(value)
    return acc
  }, {})
}
