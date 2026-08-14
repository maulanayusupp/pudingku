/**
 * `v-reveal` — adds `.is-revealed` the first time an element scrolls into view.
 *
 * Registered universally (not `.client`) because Vue's SSR renderer looks the
 * directive up while rendering and throws if it is missing; on the server it
 * contributes no attributes, so markup is delivered fully visible. That also
 * means a visitor with JS disabled sees the content rather than an empty page —
 * `.pk-reveal` is only ever added on the client.
 *
 * Usage: `<section v-reveal class="pk-stagger">`
 */

const OBSERVED = 'pk-reveal'
const VISIBLE = 'is-revealed'

export default defineNuxtPlugin((nuxtApp) => {
  if (import.meta.server) {
    nuxtApp.vueApp.directive('reveal', { getSSRProps: () => ({}) })
    return
  }

  const supported = typeof IntersectionObserver !== 'undefined'

  const observer = supported
    ? new IntersectionObserver(
      (entries, self) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add(VISIBLE)
          self.unobserve(entry.target)
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    )
    : null

  nuxtApp.vueApp.directive('reveal', {
    getSSRProps: () => ({}),

    mounted(element: HTMLElement) {
      if (!observer) {
        element.classList.add(VISIBLE)
        return
      }

      element.classList.add(OBSERVED)

      // Content already in view on load should not wait for a scroll event.
      if (element.getBoundingClientRect().top < window.innerHeight * 0.92) {
        requestAnimationFrame(() => element.classList.add(VISIBLE))
        return
      }

      observer.observe(element)
    },

    unmounted(element: HTMLElement) {
      observer?.unobserve(element)
    },
  })
})
