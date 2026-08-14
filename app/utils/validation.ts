/**
 * Tiny, dependency-free validation layer.
 *
 * Rules return a translation KEY (never a rendered sentence) so the same rule
 * set can be reused by both locales and by the server routes, which have no
 * access to the browser's i18n instance.
 */

export type ValidationKey = string | null

export type Rule<T = string> = (value: T) => ValidationKey

export type Schema<T extends Record<string, unknown>> = {
  [K in keyof T]?: Rule<T[K]>[]
}

export type Errors<T> = Partial<Record<keyof T, string>>

// ── Primitive checks ─────────────────────────────────────────────────────────

export const isBlank = (value: unknown): boolean =>
  value === null || value === undefined || (typeof value === 'string' && value.trim() === '')

/** Pragmatic email shape check — deliberately not RFC-complete. */
export const isEmail = (value: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value.trim())

/**
 * Indonesian mobile number: `08xx`, `+628xx` or `628xx`, 9–13 digits after the
 * country/leading code. Also accepts a generic `+` international number.
 */
export const isPhone = (value: string): boolean => {
  const compact = value.replace(/[\s\-().]/g, '')
  if (/^(?:\+62|62|0)8\d{7,12}$/.test(compact)) return true
  return /^\+\d{8,15}$/.test(compact)
}

/** ISO `YYYY-MM-DD` that also exists on the calendar. */
export const isIsoDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00`)
  return !Number.isNaN(date.getTime()) && value === date.toISOString().slice(0, 10)
}

export const isPostalCodeId = (value: string): boolean => /^\d{5}$/.test(value.trim())

// ── Rule factories ───────────────────────────────────────────────────────────

export const required = (key = 'validation.required'): Rule =>
  value => (isBlank(value) ? key : null)

export const minLength = (min: number, key = 'validation.minLength'): Rule =>
  value => (!isBlank(value) && value.trim().length < min ? key : null)

export const maxLength = (max: number, key = 'validation.maxLength'): Rule =>
  value => (!isBlank(value) && value.trim().length > max ? key : null)

export const email = (key = 'validation.email'): Rule =>
  value => (!isBlank(value) && !isEmail(value) ? key : null)

export const phone = (key = 'validation.phone'): Rule =>
  value => (!isBlank(value) && !isPhone(value) ? key : null)

export const isoDate = (key = 'validation.date'): Rule =>
  value => (!isBlank(value) && !isIsoDate(value) ? key : null)

export const postalCode = (key = 'validation.postalCode'): Rule =>
  value => (!isBlank(value) && !isPostalCodeId(value) ? key : null)

/** Runs an arbitrary predicate; useful for cross-field checks. */
export const satisfies = (predicate: (value: string) => boolean, key: string): Rule =>
  value => (predicate(value) ? null : key)

// ── Runner ───────────────────────────────────────────────────────────────────

/**
 * Validates a plain object against a schema and returns the FIRST failing key
 * per field, so the UI shows one message at a time.
 */
export function validate<T extends Record<string, string>>(
  values: T,
  schema: Schema<T>,
): Errors<T> {
  const errors: Errors<T> = {}

  for (const field of Object.keys(schema) as (keyof T)[]) {
    const rules = schema[field]
    if (!rules) continue

    for (const rule of rules) {
      const key = rule(values[field] ?? ('' as T[keyof T]))
      if (key) {
        errors[field] = key
        break
      }
    }
  }

  return errors
}

export const hasErrors = <T>(errors: Errors<T>): boolean => Object.keys(errors).length > 0
