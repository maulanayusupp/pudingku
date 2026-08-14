<script setup lang="ts">
import { useCartStore } from '~/stores/cart'

/**
 * Totals panel shared by the cart page and the drawer.
 *
 * Every figure is labelled an estimate on purpose: the authoritative total is
 * computed by the server when the order is submitted, and the delivery fee is
 * a placeholder until real courier rates are wired in.
 */

defineProps<{
  /** Hides the checkout button when the panel sits next to one already. */
  hideAction?: boolean
}>()

const { t } = useI18n()
const localePath = useLocalePath()
const { money } = useMoney()
const cart = useCartStore()

const total = computed(() => cart.subtotalIdr + cart.deliveryFeeIdr)
</script>

<template>
  <div class="pk-summary">
    <h2 class="pk-summary__title">
      {{ t('cart.summary') }}
    </h2>

    <FreeDeliveryMeter class="pk-summary__meter" />

    <dl class="pk-summary__rows">
      <div class="pk-summary__row">
        <dt>{{ t('cart.subtotal') }}</dt>
        <dd>{{ money(cart.subtotalIdr) }}</dd>
      </div>

      <div class="pk-summary__row">
        <dt>{{ t('cart.deliveryFee') }}</dt>
        <dd>
          <span v-if="cart.deliveryFeeIdr === 0" class="pk-summary__free">{{ t('common.free') }}</span>
          <span v-else>{{ money(cart.deliveryFeeIdr) }}</span>
        </dd>
      </div>

      <div class="pk-summary__row pk-summary__row--total">
        <dt>{{ t('cart.estimatedTotal') }}</dt>
        <dd>{{ money(total) }}</dd>
      </div>
    </dl>

    <p class="pk-summary__note">
      {{ t('cart.deliveryFeeNote') }}
    </p>

    <BaseButton
      v-if="!hideAction"
      :to="localePath('/checkout')"
      variant="accent"
      size="lg"
      block
      icon-trailing="ph:arrow-right-bold"
      :disabled="cart.isEmpty"
    >
      {{ t('cart.checkout') }}
    </BaseButton>
  </div>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-summary {
  display: flex;
  flex-direction: column;
  padding: var(--pk-space-5);
  gap: var(--pk-space-4);

  @include surface(var(--pk-radius-lg), var(--pk-shadow-sm));
}

.pk-summary__title {
  font-family: var(--pk-font-display);
  font-size: rem(20px);
  color: var(--pk-plum-800);
}

.pk-summary__rows {
  display: flex;
  flex-direction: column;
  gap: var(--pk-space-3);
}

.pk-summary__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  color: var(--pk-text-muted);
  font-size: rem(14px);
  gap: var(--pk-space-4);

  dd {
    font-variant-numeric: tabular-nums;
    font-weight: 700;
    color: var(--pk-ink-700);
  }
}

.pk-summary__row--total {
  padding-block-start: var(--pk-space-3);
  border-block-start: 1px solid var(--pk-border);
  color: var(--pk-plum-800);
  font-size: rem(16px);
  font-weight: 700;

  dd {
    font-size: rem(20px);
    font-weight: 800;
    color: var(--pk-plum-800);
  }
}

.pk-summary__free {
  color: var(--pk-success);
}

.pk-summary__note {
  color: var(--pk-text-subtle);
  font-size: rem(12px);
  line-height: var(--pk-leading-normal);
}
</style>
