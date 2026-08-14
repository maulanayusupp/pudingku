<script setup lang="ts">
import { useCartStore } from '~/stores/cart'
import type { Product } from '#shared/types/catalog'

/**
 * Catalog card.
 *
 * Structure notes:
 *  - The whole card is a link, and "add to cart" sits *outside* that link's
 *    flow (it is a sibling, positioned over the card) so the button is not a
 *    nested interactive element inside an anchor.
 *  - The product's own accent colour is applied through a CSS custom property
 *    written by a `ref` callback rather than an inline `style` attribute, which
 *    keeps all declarations in SCSS.
 */

const props = defineProps<{
  product: Product
  /** Fixed width card for horizontal rails. */
  variant?: 'grid' | 'rail'
  /** `eager` for the first row above the fold. */
  loading?: 'lazy' | 'eager'
}>()

const { t } = useI18n()
const localePath = useLocalePath()
const { money } = useMoney()
const { badgeIcon, badgeLabel } = useAllergens()
const cart = useCartStore()

const root = ref<HTMLElement | null>(null)

/**
 * Per-product colours are data, not design, so they arrive at runtime. Writing
 * them as custom properties on the element keeps the SCSS in charge of *how*
 * they are used while avoiding a `style="..."` binding in the template.
 */
watchEffect(() => {
  const element = root.value
  if (!element) return
  element.style.setProperty('--pk-card-accent', props.product.accent)
  element.style.setProperty('--pk-card-accent-soft', props.product.accentSoft)
})

const detailPath = computed(() => localePath(`/produk/${props.product.slug}`))

/** Only the first badge is shown on the card; the rest live on the detail page. */
const primaryBadge = computed(() => props.product.badges[0] ?? null)

const isInCart = computed(() => cart.quantityOf(props.product.slug) > 0)

const addToCart = () => {
  cart.add(props.product)
  cart.openDrawer()
}
</script>

<template>
  <article
    ref="root"
    class="pk-card"
    :class="[`pk-card--${variant ?? 'grid'}`, { 'is-unavailable': !product.available }]"
  >
    <NuxtLink :to="detailPath" class="pk-card__link">
      <span class="pk-sr-only">{{ product.name }} — {{ t('common.viewDetail') }}</span>
    </NuxtLink>

    <div class="pk-card__media">
      <span class="pk-card__halo" aria-hidden="true" />
      <ProductImage
        :src="product.image"
        :alt="t('a11y.productImage', { name: product.name })"
        class="pk-card__image"
        :loading="loading ?? 'lazy'"
      />

      <BaseBadge
        v-if="primaryBadge"
        class="pk-card__badge"
        tone="accent"
        size="xs"
        :icon="badgeIcon(primaryBadge)"
      >
        {{ badgeLabel(primaryBadge) }}
      </BaseBadge>
    </div>

    <div class="pk-card__body">
      <p class="pk-card__category">
        {{ t(`categories.${product.category}`) }}
      </p>

      <h3 class="pk-card__title">
        {{ product.name }}
      </h3>

      <p class="pk-card__tagline">
        {{ product.tagline }}
      </p>

      <div class="pk-card__foot">
        <div class="pk-card__pricing">
          <span class="pk-card__price">{{ money(product.priceIdr) }}</span>
          <span class="pk-card__unit">{{ product.unit }}</span>
        </div>

        <button
          type="button"
          class="pk-card__add"
          :class="{ 'is-in-cart': isInCart }"
          :disabled="!product.available"
          :aria-label="`${t('common.addToCart')} — ${product.name}`"
          @click="addToCart"
        >
          <Icon :name="isInCart ? 'ph:check-bold' : 'ph:plus-bold'" aria-hidden="true" />
        </button>
      </div>
    </div>
  </article>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--pk-bg-raised);
  border: 1px solid var(--pk-border);
  border-radius: var(--pk-radius-xl);
  overflow: hidden;
  transition:
    transform var(--pk-duration-base) var(--pk-ease-jelly),
    box-shadow var(--pk-duration-base) var(--pk-ease-out),
    border-color var(--pk-duration-base) var(--pk-ease-out);

  @include hover-capable {
    &:hover {
      border-color: var(--pk-card-accent-soft, var(--pk-caramel-300));
      box-shadow: var(--pk-shadow-lg);
      transform: translateY(-6px);
    }

    &:hover .pk-card__image {
      transform: scale(1.06) rotate(-1.5deg);
    }

    &:hover .pk-card__halo {
      transform: scale(1.12);
      opacity: 0.9;
    }
  }

  &:focus-within {
    border-color: var(--pk-caramel-500);
    box-shadow: var(--pk-shadow-md);
  }

  @include reduced-motion {
    &:hover {
      transform: none;
    }
  }
}

.pk-card--rail {
  width: min(310px, 78vw);
}

.is-unavailable {
  opacity: 0.62;
}

/// Covers the card so the whole surface is clickable, while the add button
/// sits above it in the stacking order.
.pk-card__link {
  position: absolute;
  z-index: 2;
  inset: 0;

  @include focus-ring(-4px);
}

.pk-card__media {
  position: relative;
  display: grid;
  aspect-ratio: 1 / 1;
  background: linear-gradient(160deg, var(--pk-cream-100), var(--pk-cream-200));
  overflow: hidden;
  place-items: center;
}

/// Soft colour wash behind the product, tinted by the product's own accent.
.pk-card__halo {
  position: absolute;
  width: 74%;
  aspect-ratio: 1;
  background: radial-gradient(circle, var(--pk-card-accent-soft, var(--pk-caramel-300)) 0%, transparent 68%);
  border-radius: 50%;
  opacity: 0.55;
  transition:
    transform var(--pk-duration-slow) var(--pk-ease-out),
    opacity var(--pk-duration-slow) var(--pk-ease-out);
}

.pk-card__image {
  position: relative;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--pk-duration-slow) var(--pk-ease-out);
}

.pk-card__badge {
  position: absolute;
  z-index: 3;
  inset-block-start: var(--pk-space-3);
  inset-inline-start: var(--pk-space-3);
  box-shadow: var(--pk-shadow-xs);
}

.pk-card__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: var(--pk-space-5);
  gap: var(--pk-space-2);
}

.pk-card__category {
  @include eyebrow;

  color: var(--pk-card-accent, var(--pk-caramel-700));
}

.pk-card__title {
  font-family: var(--pk-font-display);
  font-size: fluid(19px, 23px);
  font-weight: 600;
  color: var(--pk-plum-800);
  line-height: var(--pk-leading-snug);
}

.pk-card__tagline {
  @include line-clamp(2);

  flex: 1;
  color: var(--pk-text-muted);
  font-size: rem(14px);
  line-height: var(--pk-leading-normal);
}

.pk-card__foot {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding-block-start: var(--pk-space-3);
  margin-block-start: var(--pk-space-2);
  border-block-start: 1px dashed var(--pk-border);
  gap: var(--pk-space-3);
}

.pk-card__pricing {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.pk-card__price {
  color: var(--pk-plum-800);
  font-size: rem(18px);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}

.pk-card__unit {
  color: var(--pk-text-subtle);
  font-size: rem(12px);
}

.pk-card__add {
  position: relative;
  z-index: 3;
  display: grid;
  flex-shrink: 0;
  width: 2.75rem;
  height: 2.75rem;
  background: var(--pk-plum-600);
  border-radius: var(--pk-radius-pill);
  color: var(--pk-cream-100);
  font-size: rem(15px);
  place-items: center;
  transition:
    background-color var(--pk-duration-fast) var(--pk-ease-out),
    transform var(--pk-duration-base) var(--pk-ease-jelly);

  @include focus-ring(3px);

  @include hover-capable {
    &:hover:not(:disabled) {
      background: var(--pk-caramel-600);
      color: var(--pk-plum-900);
      transform: scale(1.1);
    }
  }

  &:active:not(:disabled) {
    transform: scale(0.92);
  }

  &.is-in-cart {
    background: var(--pk-success);
  }

  &:disabled {
    background: var(--pk-cream-300);
    color: var(--pk-text-subtle);
    cursor: not-allowed;
  }
}
</style>
