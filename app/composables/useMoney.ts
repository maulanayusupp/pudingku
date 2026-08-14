import { formatIdr, formatNumber, formatWeight } from '~/utils/format'

/**
 * Locale-aware money and measurement formatting.
 *
 * Components call `money(45000)` instead of importing the formatter and passing
 * the current locale by hand, which is what previously caused prices to render
 * in the wrong grouping after a language switch.
 */
export function useMoney() {
  const { locale } = useI18n()

  const money = (amount: number): string => formatIdr(amount, locale.value)
  const number = (value: number): string => formatNumber(value, locale.value)
  const weight = (grams: number): string => formatWeight(grams, locale.value)

  return { money, number, weight }
}
