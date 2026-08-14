/**
 * Navigation model.
 *
 * `route` is the *page name* from `app/pages`, not a URL — the components turn
 * it into a localized path with `useLocalePath()`, so Indonesian visitors get
 * `/produk` and English visitors get `/products` from the same entry.
 * `labelKey` points at `i18n/locales/*.json`.
 */

export interface NavItem {
  /** Nuxt route path key resolved through `localePath()`. */
  route: string
  labelKey: string
  /** Optional icon name (Iconify) shown in the mobile menu. */
  icon?: string
}

export const PRIMARY_NAV: NavItem[] = [
  { route: '/produk', labelKey: 'nav.products', icon: 'ph:storefront-duotone' },
  { route: '/tentang', labelKey: 'nav.about', icon: 'ph:heart-duotone' },
  { route: '/tanya-jawab', labelKey: 'nav.faq', icon: 'ph:question-duotone' },
  { route: '/kontak', labelKey: 'nav.contact', icon: 'ph:chat-circle-dots-duotone' },
]

export const FOOTER_SHOP_NAV: NavItem[] = [
  { route: '/produk', labelKey: 'nav.allProducts' },
  { route: '/keranjang', labelKey: 'nav.cart' },
]

export const FOOTER_COMPANY_NAV: NavItem[] = [
  { route: '/tentang', labelKey: 'nav.about' },
  { route: '/kontak', labelKey: 'nav.contact' },
  { route: '/tanya-jawab', labelKey: 'nav.faq' },
]

/**
 * Compliance documents. `doc` is the `[doc]` route param; each key must exist
 * under `compliance.docs.<doc>` in BOTH locale files.
 */
export const COMPLIANCE_DOCS = [
  'privacy',
  'terms',
  'refund',
  'shipping',
  'allergens',
  'cookies',
] as const

export type ComplianceDoc = (typeof COMPLIANCE_DOCS)[number]

export const COMPLIANCE_DOC_ICONS: Record<ComplianceDoc, string> = {
  privacy: 'ph:shield-check-duotone',
  terms: 'ph:scroll-duotone',
  refund: 'ph:arrow-u-up-left-duotone',
  shipping: 'ph:truck-duotone',
  allergens: 'ph:warning-circle-duotone',
  cookies: 'ph:cookie-duotone',
}
