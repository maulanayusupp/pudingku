/**
 * Locks page scroll while an overlay (cart drawer, mobile menu) is open.
 *
 * Uses a reference count so two overlays closing out of order cannot unlock the
 * page while one is still visible. Also compensates for the scrollbar width so
 * the layout does not jump on desktop.
 */

const lockCount = ref(0)

export function useScrollLock(isLocked: Ref<boolean>) {
  const apply = (locked: boolean) => {
    if (!import.meta.client) return

    lockCount.value = Math.max(0, lockCount.value + (locked ? 1 : -1))
    const root = document.documentElement
    const shouldLock = lockCount.value > 0

    root.classList.toggle('pk-scroll-locked', shouldLock)
    root.classList.toggle('pk-has-overlay', shouldLock)
  }

  watch(isLocked, (locked, previous) => {
    if (locked === previous) return
    apply(locked)
  })

  onBeforeUnmount(() => {
    if (isLocked.value) apply(false)
  })
}
