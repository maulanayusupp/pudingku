<script setup lang="ts">
import { useCartStore } from '~/stores/cart'

/**
 * Progress toward the free-delivery threshold.
 *
 * The bar width comes from a CSS custom property written by a watcher rather
 * than an inline `style` binding, keeping every declaration inside SCSS.
 * The threshold is a demo figure — the surrounding copy says as much.
 */

const { t } = useI18n()
const { money } = useMoney()
const cart = useCartStore()

const bar = ref<HTMLElement | null>(null)

watchEffect(() => {
  const element = bar.value
  if (!element) return
  element.style.setProperty('--pk-progress', `${Math.round(cart.freeDeliveryProgress * 100)}%`)
})

const reached = computed(() => cart.amountToFreeDeliveryIdr === 0)
</script>

<template>
  <div class="pk-meter" :class="{ 'is-reached': reached }">
    <p class="pk-meter__label">
      <Icon :name="reached ? 'ph:confetti-duotone' : 'ph:truck-duotone'" aria-hidden="true" />
      <span v-if="reached">{{ t('cart.freeDeliveryReached') }}</span>
      <span v-else>{{ t('cart.freeDeliveryProgress', { amount: money(cart.amountToFreeDeliveryIdr) }) }}</span>
    </p>

    <div
      ref="bar"
      class="pk-meter__track"
      role="progressbar"
      :aria-valuenow="Math.round(cart.freeDeliveryProgress * 100)"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <span class="pk-meter__fill" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-meter {
  display: flex;
  flex-direction: column;
  padding: var(--pk-space-3) var(--pk-space-4);
  background: var(--pk-cream-200);
  border-radius: var(--pk-radius-md);
  gap: var(--pk-space-2);
}

.pk-meter__label {
  display: flex;
  align-items: center;
  color: var(--pk-ink-700);
  font-size: rem(13px);
  font-weight: 600;
  gap: 0.45em;
}

.pk-meter__track {
  position: relative;
  height: 8px;
  background: var(--pk-cream-400);
  border-radius: var(--pk-radius-pill);
  overflow: hidden;
}

.pk-meter__fill {
  position: absolute;
  width: var(--pk-progress, 0%);
  background: linear-gradient(90deg, var(--pk-caramel-500), var(--pk-berry));
  border-radius: var(--pk-radius-pill);
  inset-block: 0;
  inset-inline-start: 0;
  transition: width var(--pk-duration-slow) var(--pk-ease-out);
}

.is-reached {
  background: #e9f2ea;

  .pk-meter__label {
    color: var(--pk-success);
  }

  .pk-meter__fill {
    background: var(--pk-success);
  }
}
</style>
