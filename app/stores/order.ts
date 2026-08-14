import { defineStore } from 'pinia'
import { STORAGE_KEYS, readJson, removeKey, writeJson } from '~/utils/storage'
import type { OrderSummary } from '#shared/types/order'

/**
 * Holds the most recent order summary so the confirmation page can render it
 * after a redirect.
 *
 * It is mirrored into localStorage purely so a reload of the confirmation page
 * does not lose the reference number the visitor was told to keep. Since the
 * backend stores nothing in this build, that copy is the visitor's only record —
 * which is exactly why the confirmation page tells them to email it to us.
 */
export const useOrderStore = defineStore('order', () => {
  const lastOrder = ref<OrderSummary | null>(null)

  const hasOrder = computed(() => lastOrder.value !== null)

  function remember(order: OrderSummary): void {
    lastOrder.value = order
    writeJson(STORAGE_KEYS.lastOrder, order)
  }

  function restore(): void {
    if (lastOrder.value) return
    lastOrder.value = readJson<OrderSummary | null>(STORAGE_KEYS.lastOrder, null)
  }

  function forget(): void {
    lastOrder.value = null
    removeKey(STORAGE_KEYS.lastOrder)
  }

  return { lastOrder, hasOrder, remember, restore, forget }
})
