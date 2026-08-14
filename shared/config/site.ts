/**
 * Single source of truth for business facts that appear across the site
 * (header, footer, SEO, schema.org, compliance pages, contact page).
 *
 * IMPORTANT — evidence policy:
 * Only values that were explicitly provided by the business owner are filled in.
 * Everything that is not yet verified is marked with `verified: false` and MUST
 * be reviewed before going to production. The UI hides unverified optional
 * fields instead of inventing plausible-looking data.
 * See TODO.md → "Data bisnis yang harus diverifikasi".
 */

export interface VerifiableValue<T> {
  value: T
  /** `true` only when the owner has confirmed the value. */
  verified: boolean
}

const v = <T>(value: T, verified: boolean): VerifiableValue<T> => ({ value, verified })

export const SITE = {
  /** Brand name as displayed. */
  name: 'Pudingku',
  /** Short legal/entity label used in compliance copy. */
  legalName: 'Pudingku',
  /**
   * Domain is configurable via NUXT_PUBLIC_SITE_URL; this is the build-time
   * default and points at the current Vercel deployment. Change it here AND in
   * `nuxt.config.ts` when a custom domain is connected — social crawlers cache
   * the absolute URLs they first see.
   */
  defaultUrl: 'https://pudingku-hazel.vercel.app',
  defaultLocale: 'id',

  /** Confirmed by the owner. */
  owner: v('Maulana Yusup Abdullah', true),
  email: v('maulanayusupp@gmail.com', true),

  /**
   * NOT provided by the owner yet — intentionally empty so nothing fake is
   * rendered. Fill in and flip `verified` to true to make them appear.
   */
  phone: v('', false),
  whatsapp: v('', false),
  addressStreet: v('', false),
  addressCity: v('', false),
  addressRegion: v('', false),
  addressPostalCode: v('', false),
  addressCountry: v('ID', true),
  businessRegistrationNumber: v('', false),
  taxId: v('', false),
  halalCertificateNumber: v('', false),
  foodSafetyRegistrationNumber: v('', false),

  social: {
    instagram: v('', false),
    tiktok: v('', false),
    facebook: v('', false),
  },

  /** Operating hours are unconfirmed; the UI falls back to "by order" copy. */
  openingHours: v<string[]>([], false),
} as const

/** Helper: only surface a value when the owner has verified it. */
export const confirmed = <T>(field: VerifiableValue<T>): T | null =>
  field.verified && field.value !== '' ? field.value : null
