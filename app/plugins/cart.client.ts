import type { Composer } from 'vue-i18n'
import { catalogService } from '~/services/catalog.service'
import { useCartStore } from '~/stores/cart'

/**
 * Restores the cart from localStorage after hydration.
 *
 * Deliberately client-only and deliberately *after* mount: rendering a
 * localStorage-backed cart during SSR would produce a hydration mismatch, and
 * the header badge would flicker. The store re-reads live prices from the
 * catalog rather than trusting the stored snapshot.
 *
 * IMPORTANT — do not call `useI18n()` in this plugin's setup body.
 * `useI18n()` needs an active vue-i18n instance, which only exists once the
 * i18n plugin has installed. Calling it here throws
 * "Must be called at the top of a `setup` function", which aborts app
 * initialisation and leaves the visitor with a blank page.
 * The locale is therefore read lazily from `nuxtApp.$i18n`, inside hooks that
 * run after every plugin has been installed.
 */
export default defineNuxtPlugin({
  name: 'pk-cart',
  setup(nuxtApp) {
    const cart = useCartStore(nuxtApp.$pinia as never)

    /** Active locale, or the default when i18n is not ready yet. */
    const currentLocale = (): string => {
      const i18n = nuxtApp.$i18n as Composer | undefined
      return (i18n?.locale?.value as string | undefined) ?? 'id'
    }

    const loadCatalog = async () => {
      try {
        const { items } = await catalogService.list({ locale: currentLocale() as never })
        return items
      } catch {
        // Offline or the API is down — leave the cart empty rather than
        // resurrecting stale prices the server can no longer confirm.
        return []
      }
    }

    nuxtApp.hook('app:mounted', async () => {
      cart.hydrate(await loadCatalog())

      // Re-label cart lines when the language changes. Registered here, not in
      // setup, so `$i18n` is guaranteed to exist.
      const i18n = nuxtApp.$i18n as Composer | undefined
      if (!i18n) return

      watch(i18n.locale, async () => {
        if (cart.isEmpty) return
        cart.relabel(await loadCatalog())
      })
    })
  },
})
