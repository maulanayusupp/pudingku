<script setup lang="ts">
import type { Product } from '#shared/types/catalog'

/**
 * Horizontal snap-scrolling rail of the ten pudding variants.
 *
 * A rail rather than a grid because ten items in a grid reads as a warehouse,
 * while a rail reads as a shelf — and it keeps the section short on mobile.
 * Arrow buttons are provided for pointer users; the rail is natively scrollable
 * and keyboard-reachable through the cards themselves.
 */

defineProps<{ items: Product[], pending?: boolean }>()

const { t } = useI18n()
const localePath = useLocalePath()

const rail = ref<HTMLElement | null>(null)
const { x, arrivedState } = useScroll(rail, { behavior: 'smooth' })

const scrollBy = (direction: 1 | -1) => {
  const element = rail.value
  if (!element) return
  x.value = element.scrollLeft + direction * Math.round(element.clientWidth * 0.82)
}
</script>

<template>
  <section class="pk-rail pk-section">
    <div class="pk-container--wide">
      <div class="pk-rail__head">
        <SectionHeading
          :eyebrow="t('home.signature.eyebrow')"
          :title="t('home.signature.title')"
          :description="t('home.signature.description')"
        />

        <div class="pk-rail__nav">
          <button
            type="button"
            class="pk-rail__arrow"
            :disabled="arrivedState.left"
            :aria-label="t('a11y.scrollLeft')"
            @click="scrollBy(-1)"
          >
            <Icon name="ph:arrow-left-bold" aria-hidden="true" />
          </button>
          <button
            type="button"
            class="pk-rail__arrow"
            :disabled="arrivedState.right"
            :aria-label="t('a11y.scrollRight')"
            @click="scrollBy(1)"
          >
            <Icon name="ph:arrow-right-bold" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>

    <div ref="rail" class="pk-rail__scroller">
      <div class="pk-rail__spacer" aria-hidden="true" />

      <template v-if="pending">
        <div v-for="index in 5" :key="`s-${index}`" class="pk-rail__skeleton pk-skeleton" />
      </template>

      <ProductCard
        v-for="(product, index) in items"
        v-else
        :key="product.id"
        :product="product"
        variant="rail"
        :loading="index < 3 ? 'eager' : 'lazy'"
      />

      <div class="pk-rail__spacer" aria-hidden="true" />
    </div>

    <div class="pk-container--wide">
      <BaseButton
        :to="localePath('/produk')"
        variant="outline"
        icon-trailing="ph:arrow-up-right-bold"
        class="pk-rail__cta"
      >
        {{ t('home.signature.cta') }}
      </BaseButton>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-rail {
  overflow: hidden;
}

.pk-rail__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--pk-space-5);
  margin-block-end: var(--pk-space-7);
}

.pk-rail__nav {
  display: none;
  gap: var(--pk-space-2);

  @include up('md') {
    display: flex;
  }
}

.pk-rail__arrow {
  display: grid;
  width: 3rem;
  height: 3rem;
  border: 1px solid var(--pk-border-strong);
  background: var(--pk-bg-raised);
  border-radius: var(--pk-radius-pill);
  color: var(--pk-plum-700);
  place-items: center;

  @include focus-ring(3px);
  @include jelly(1.08);

  @include hover-capable {
    &:hover:not(:disabled) {
      background: var(--pk-caramel-100);
      border-color: var(--pk-caramel-400);
    }
  }

  &:disabled {
    color: var(--pk-text-subtle);
    cursor: not-allowed;
    opacity: 0.5;
  }
}

.pk-rail__scroller {
  @include snap-scroller(var(--pk-space-4));

  padding-block: var(--pk-space-2) var(--pk-space-6);
  scroll-padding-inline-start: var(--pk-gutter);
}

/// Invisible spacers give the first and last card the same inset as the page
/// gutter without breaking the scroll-snap alignment.
.pk-rail__spacer {
  width: calc(var(--pk-gutter) - var(--pk-space-4));
  min-width: 1px;
}

.pk-rail__skeleton {
  width: min(310px, 78vw);
  aspect-ratio: 3 / 4;
  border-radius: var(--pk-radius-xl);
}

.pk-rail__cta {
  margin-block-start: var(--pk-space-2);
}
</style>
