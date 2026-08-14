/**
 * Subtle pointer parallax for the hero art.
 *
 * Writes two CSS custom properties (`--pk-px`, `--pk-py`, range -1..1) onto the
 * target element; the SCSS decides how far each layer actually moves. Setting a
 * custom property from JS keeps all the visual maths in SCSS and avoids inline
 * style rules in the template.
 *
 * Disabled entirely on coarse pointers and when the visitor prefers reduced
 * motion — a hover effect on a phone is just a jitter.
 */
export function usePointerParallax(target: Ref<HTMLElement | null>, strength = 1) {
  const reduced = usePreferredReducedMotion()
  let frame = 0

  const write = (x: number, y: number) => {
    const element = target.value
    if (!element) return
    element.style.setProperty('--pk-px', String(x * strength))
    element.style.setProperty('--pk-py', String(y * strength))
  }

  const onMove = (event: PointerEvent) => {
    if (event.pointerType !== 'mouse') return
    cancelAnimationFrame(frame)
    frame = requestAnimationFrame(() => {
      const x = (event.clientX / window.innerWidth) * 2 - 1
      const y = (event.clientY / window.innerHeight) * 2 - 1
      write(x, y)
    })
  }

  const reset = () => {
    cancelAnimationFrame(frame)
    write(0, 0)
  }

  onMounted(() => {
    if (!import.meta.client) return
    if (reduced.value === 'reduce') return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', reset, { passive: true })
  })

  onBeforeUnmount(() => {
    if (!import.meta.client) return
    cancelAnimationFrame(frame)
    window.removeEventListener('pointermove', onMove)
    window.removeEventListener('pointerleave', reset)
  })
}
