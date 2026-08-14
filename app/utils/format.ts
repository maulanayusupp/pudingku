import type { LocaleCode } from '#shared/types/catalog'

/**
 * Formatting helpers. Everything here is pure and framework-free so it can be
 * unit-tested and reused by the Nitro server routes.
 */

const LOCALE_TAG: Record<LocaleCode, string> = {
  id: 'id-ID',
  en: 'en-US',
}

const toTag = (locale: string): string => LOCALE_TAG[locale as LocaleCode] ?? LOCALE_TAG.id

/**
 * Rupiah amount, always without decimals — Indonesian retail prices are whole
 * rupiah and the trailing `,00` only adds noise.
 *
 * `formatIdr(45000)` → `Rp45.000`
 */
export function formatIdr(amount: number, locale = 'id'): string {
  return new Intl.NumberFormat(toTag(locale), {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Plain grouped number, e.g. `1.240`. */
export function formatNumber(value: number, locale = 'id'): string {
  return new Intl.NumberFormat(toTag(locale)).format(value)
}

/** `formatWeight(900)` → `900 g`; `formatWeight(1100)` → `1,1 kg` */
export function formatWeight(grams: number, locale = 'id'): string {
  if (grams < 1000) return `${formatNumber(grams, locale)} g`
  return `${new Intl.NumberFormat(toTag(locale), { maximumFractionDigits: 1 }).format(grams / 1000)} kg`
}

/** Long readable date, e.g. `14 Agustus 2026`. */
export function formatDate(value: string | Date, locale = 'id'): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(toTag(locale), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

/** Date + time, used on the order confirmation screen. */
export function formatDateTime(value: string | Date, locale = 'id'): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat(toTag(locale), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

/**
 * Turns a lead time in hours into a short human phrase.
 * Returns the raw count so the caller can feed it into a translation with a
 * plural rule rather than concatenating words here.
 */
export function leadTimeParts(hours: number): { unit: 'hour' | 'day', count: number } {
  if (hours < 24) return { unit: 'hour', count: hours }
  return { unit: 'day', count: Math.round(hours / 24) }
}

/** URL-safe slug. Handles Indonesian text (no diacritics to strip in practice). */
export function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Truncate on a word boundary and append an ellipsis. */
export function truncate(input: string, max = 140): string {
  if (input.length <= max) return input
  const cut = input.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}

/** First letter of each of the first two words — used by avatar placeholders. */
export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('')
}

/**
 * Normalises an Indonesian phone number to the `+62` form.
 * Returns the trimmed input unchanged when it does not look Indonesian, so we
 * never silently corrupt an international number.
 */
export function normalizePhoneId(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, '')
  if (digits.startsWith('+62')) return digits
  if (digits.startsWith('62')) return `+${digits}`
  if (digits.startsWith('0')) return `+62${digits.slice(1)}`
  return raw.trim()
}
