/**
 * Small collection helpers used by the catalog UI.
 * Kept separate from `format.ts` so tree-shaking stays clean.
 */

/** Remove duplicates, keeping the first occurrence, keyed by a selector. */
export function uniqueBy<T, K>(items: T[], key: (item: T) => K): T[] {
  const seen = new Set<K>()
  return items.filter((item) => {
    const value = key(item)
    if (seen.has(value)) return false
    seen.add(value)
    return true
  })
}

/** Split an array into fixed-size chunks. */
export function chunk<T>(items: T[], size: number): T[][] {
  if (size <= 0) return [items]
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

/** Group items into a record keyed by a selector. */
export function groupBy<T, K extends string>(items: T[], key: (item: T) => K): Record<K, T[]> {
  return items.reduce((acc, item) => {
    const group = key(item)
    ;(acc[group] ||= []).push(item)
    return acc
  }, {} as Record<K, T[]>)
}

/** Sum a numeric projection. */
export const sumBy = <T>(items: T[], value: (item: T) => number): number =>
  items.reduce((total, item) => total + value(item), 0)

/** Smallest / largest projection, or `0` for an empty list. */
export const minBy = <T>(items: T[], value: (item: T) => number): number =>
  items.length ? Math.min(...items.map(value)) : 0

export const maxBy = <T>(items: T[], value: (item: T) => number): number =>
  items.length ? Math.max(...items.map(value)) : 0

/**
 * Deterministic pseudo-shuffle driven by a seed, so server and client render
 * the same order and hydration never mismatches.
 */
export function seededPick<T>(items: T[], count: number, seed: number): T[] {
  const pool = [...items]
  const out: T[] = []
  let state = seed || 1

  while (pool.length && out.length < count) {
    state = (state * 1664525 + 1013904223) % 4294967296
    const index = state % pool.length
    out.push(pool.splice(index, 1)[0]!)
  }

  return out
}

/** Clamp a number into an inclusive range. */
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max)
