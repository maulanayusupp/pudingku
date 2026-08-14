import type { AllergenCode, ProductBadge } from '#shared/types/catalog'

/**
 * Maps allergen and badge codes to their icon + translation key.
 *
 * Codes live in the data layer; every label lives in `i18n/locales/*.json`.
 * Adding a new code means adding it here AND in both locale files — the
 * `label` getters below fall back to the raw code so a missing translation is
 * visible in review rather than rendering an empty chip.
 */

const ALLERGEN_ICONS: Record<AllergenCode, string> = {
  dairy: 'ph:drop-duotone',
  egg: 'ph:egg-duotone',
  gluten: 'ph:grains-duotone',
  nut: 'ph:tree-duotone',
  soy: 'ph:plant-duotone',
  coconut: 'ph:leaf-duotone',
  sesame: 'ph:dots-three-circle-duotone',
}

const BADGE_ICONS: Record<ProductBadge, string> = {
  'signature': 'ph:crown-simple-duotone',
  'new': 'ph:sparkle-duotone',
  'bestseller-internal': 'ph:trend-up-duotone',
  'seasonal': 'ph:sun-duotone',
  'egg-free': 'ph:egg-crack-duotone',
  'gluten-free': 'ph:grains-slash-duotone',
}

export function useAllergens() {
  const { t, te } = useI18n()

  const allergenLabel = (code: AllergenCode): string =>
    te(`allergens.${code}`) ? t(`allergens.${code}`) : code

  const allergenIcon = (code: AllergenCode): string =>
    ALLERGEN_ICONS[code] ?? 'ph:info-duotone'

  const badgeLabel = (code: ProductBadge): string =>
    te(`badges.${code}`) ? t(`badges.${code}`) : code

  const badgeIcon = (code: ProductBadge): string =>
    BADGE_ICONS[code] ?? 'ph:tag-duotone'

  return { allergenLabel, allergenIcon, badgeLabel, badgeIcon }
}
