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
 * It also re-labels the cart when the language changes so line names follow the
 * active locale.
 */
export default defineNuxtPlugin({
  name: 'pk-cart',
  parallel: true,
  async setup(nuxtApp) {
    const cart = useCartStore(nuxtApp.$pinia as never)
    const { locale } = useI18n()

    const loadCatalog = async () => {
      try {
        const { items } = await catalogService.list({ locale: locale.value as never })
        return items
      } catch {
        // Offline or the API is down — leave the cart empty rather than
        // resurrecting stale prices the server can no longer confirm.
        return []
      }
    }

    nuxtApp.hook('app:mounted', async () => {
      cart.hydrate(await loadCatalog())
    })

    watch(locale, async () => {
      if (cart.isEmpty) return
      cart.relabel(await loadCatalog())
    })
  },
})
