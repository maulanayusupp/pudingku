<script setup lang="ts">
import type { Product } from '#shared/types/catalog'

/**
 * Responsive catalog grid with a skeleton state.
 *
 * The skeleton renders the same number of columns as the real grid so the
 * layout does not shift when data arrives.
 */

interface Props {
  items: Product[]
  pending?: boolean
  /** How many placeholder cards to draw while pending. */
  skeletonCount?: number
  /** Number of leading cards to load eagerly (above the fold). */
  eagerCount?: number
}

withDefaults(defineProps<Props>(), {
  skeletonCount: 8,
  eagerCount: 4,
})

const { t } = useI18n()
</script>

<template>
  <div v-if="pending" class="pk-grid" :aria-label="t('a11y.loading')" aria-busy="true">
    <div
      v-for="index in skeletonCount"
      :key="`skeleton-${index}`"
      class="pk-grid__skeleton pk-skeleton"
    />
  </div>

  <div v-else v-reveal class="pk-grid pk-stagger">
    <ProductCard
      v-for="(product, index) in items"
      :key="product.id"
      :product="product"
      :loading="index < eagerCount ? 'eager' : 'lazy'"
    />
  </div>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-grid {
  @include auto-grid(258px, var(--pk-space-5));
}

.pk-grid__skeleton {
  aspect-ratio: 3 / 4;
  border-radius: var(--pk-radius-xl);
}
</style>
