/**
 * Minimal focus trap for the cart drawer and any future modal.
 *
 * Written by hand rather than pulling in `focus-trap` via
 * `@vueuse/integrations`: the drawer needs exactly three behaviours — move
 * focus in, keep Tab inside, restore focus on close — and that is ~40 lines.
 *
 * Escape handling stays with the caller, since what "close" means differs
 * between an overlay and a nested popover.
 */

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function useDialogFocus(
  container: Ref<HTMLElement | null>,
  isOpen: Ref<boolean>,
) {
  let previouslyFocused: HTMLElement | null = null

  const focusableItems = (): HTMLElement[] => {
    const root = container.value
    if (!root) return []
    return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE))
      .filter(element => element.offsetParent !== null || element === document.activeElement)
  }

  const onKeydown = (event: KeyboardEvent) => {
    if (event.key !== 'Tab' || !isOpen.value) return

    const items = focusableItems()
    if (items.length === 0) {
      event.preventDefault()
      return
    }

    const first = items[0]!
    const last = items[items.length - 1]!
    const active = document.activeElement

    if (event.shiftKey && (active === first || !container.value?.contains(active))) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  watch(isOpen, async (open) => {
    if (!import.meta.client) return

    if (open) {
      previouslyFocused = document.activeElement as HTMLElement | null
      await nextTick()
      focusableItems()[0]?.focus()
      document.addEventListener('keydown', onKeydown)
    } else {
      document.removeEventListener('keydown', onKeydown)
      previouslyFocused?.focus()
      previouslyFocused = null
    }
  })

  onBeforeUnmount(() => {
    if (!import.meta.client) return
    document.removeEventListener('keydown', onKeydown)
  })
}
