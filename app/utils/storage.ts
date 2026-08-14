/**
 * SSR-safe wrapper around `localStorage`.
 *
 * Reads return `null` on the server and whenever storage is unavailable
 * (private browsing, disabled cookies, quota errors) instead of throwing.
 */

const canUseStorage = (): boolean => {
  if (typeof window === 'undefined') return false
  try {
    const probe = '__pk_probe__'
    window.localStorage.setItem(probe, '1')
    window.localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

export function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function writeJson(key: string, value: unknown): boolean {
  if (!canUseStorage()) return false
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeKey(key: string): void {
  if (!canUseStorage()) return
  try {
    window.localStorage.removeItem(key)
  } catch {
    // Nothing to do — the value simply stays.
  }
}

/** Storage keys are centralised so they never drift between modules. */
export const STORAGE_KEYS = {
  cart: 'pk.cart.v1',
  lastOrder: 'pk.order.last.v1',
  cookieConsent: 'pk.consent.v1',
} as const
