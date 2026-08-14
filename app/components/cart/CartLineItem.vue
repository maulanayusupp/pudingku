<script setup lang="ts">
import { useCartStore } from '~/stores/cart'
import { PRICING_CLIENT } from '~/constants/pricing'
import type { CartLine } from '~/stores/cart'

/** One row in the cart drawer and on the cart page. */

const props = defineProps<{
  line: CartLine
  /** Compact layout for the drawer. */
  dense?: boolean
}>()

const { t } = useI18n()
const localePath = useLocalePath()
const { money } = useMoney()
const cart = useCartStore()

const quantity = computed({
  get: () => props.line.quantity,
  set: (value: number) => cart.setQuantity(props.line.slug, value),
})

const lineTotal = computed(() => props.line.priceIdr * props.line.quantity)
</script>

<template>
  <li class="pk-line" :class="{ 'is-dense': dense }">
    <NuxtLink :to="localePath(`/produk/${line.slug}`)" class="pk-line__thumb">
      <ProductImage
        :src="line.image"
        :alt="t('a11y.productImage', { name: line.name })"
        :size="180"
        loading="lazy"
      />
    </NuxtLink>

    <div class="pk-line__body">
      <NuxtLink :to="localePath(`/produk/${line.slug}`)" class="pk-line__name">
        {{ line.name }}
      </NuxtLink>
      <p class="pk-line__unit">
        {{ line.unit }} · {{ money(line.priceIdr) }}
      </p>

      <div class="pk-line__controls">
        <QuantityStepper
          v-model="quantity"
          size="sm"
          :max="PRICING_CLIENT.maxQuantityPerLine"
          :label="`${t('common.quantity')} — ${line.name}`"
        />

        <button
          type="button"
          class="pk-line__remove"
          :aria-label="t('cart.removeItem', { name: line.name })"
          @click="cart.remove(line.slug)"
        >
          <Icon name="ph:trash-simple-bold" aria-hidden="true" />
          <span class="pk-line__removeLabel">{{ t('common.remove') }}</span>
        </button>
      </div>
    </div>

    <p class="pk-line__total">
      {{ money(lineTotal) }}
    </p>
  </li>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-line {
  display: grid;
  align-items: start;
  padding-block: var(--pk-space-4);
  border-block-end: 1px dashed var(--pk-border);
  gap: var(--pk-space-4);
  grid-template-columns: auto 1fr auto;

  &:last-child {
    border-block-end: 0;
  }
}

.pk-line__thumb {
  display: block;
  width: 5.5rem;
  border-radius: var(--pk-radius-md);
  overflow: hidden;
  background: var(--pk-cream-200);

  @include focus-ring(3px);
  @include jelly(1.05);

  img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
  }
}

.is-dense .pk-line__thumb {
  width: 4.25rem;
}

.pk-line__body {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--pk-space-2);
}

.pk-line__name {
  font-family: var(--pk-font-display);
  font-size: rem(17px);
  font-weight: 600;
  color: var(--pk-plum-800);
  line-height: var(--pk-leading-snug);

  @include focus-ring(3px);

  @include hover-capable {
    &:hover {
      color: var(--pk-caramel-700);
    }
  }
}

.pk-line__unit {
  color: var(--pk-text-muted);
  font-size: rem(13px);
}

.pk-line__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--pk-space-3);
  margin-block-start: var(--pk-space-1);
}

.pk-line__remove {
  display: inline-flex;
  align-items: center;
  color: var(--pk-text-muted);
  font-size: rem(12.5px);
  font-weight: 600;
  gap: 0.35em;
  transition: color var(--pk-duration-fast) var(--pk-ease-out);

  @include focus-ring(3px);

  @include hover-capable {
    &:hover {
      color: var(--pk-danger);
    }
  }
}

.is-dense .pk-line__removeLabel {
  @include visually-hidden;
}

.pk-line__total {
  color: var(--pk-plum-800);
  font-size: rem(15px);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
</style>
