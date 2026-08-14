<script setup lang="ts">
import { useCartStore } from '~/stores/cart'
import { PRICING_CLIENT } from '~/constants/pricing'

/**
 * Cart page.
 *
 * `noindex` because a cart URL has no value in search results and would only
 * dilute the catalog pages. The route is also blocked in robots.txt.
 * Everything below the fold is client-rendered: the cart lives in localStorage,
 * so there is nothing meaningful to server-render.
 */

const { t } = useI18n()
const localePath = useLocalePath()
const cart = useCartStore()

const confirmClear = () => {
  if (import.meta.client && !window.confirm(t('cart.clearConfirm'))) return
  cart.clear()
}

useSeoPage(() => ({
  title: t('cart.meta.title'),
  description: t('cart.meta.description'),
  noindex: true,
}))
</script>

<template>
  <div class="pk-cartPage pk-section">
    <div class="pk-container--wide">
      <BreadcrumbTrail
        class="pk-cartPage__crumbs"
        :items="[
          { label: t('nav.home'), to: localePath('/') },
          { label: t('cart.title') },
        ]"
      />

      <h1 class="pk-cartPage__title">
        {{ t('cart.title') }}
      </h1>

      <ClientOnly>
        <div v-if="!cart.isEmpty" class="pk-cartPage__grid">
          <section class="pk-cartPage__lines" :aria-label="t('cart.title')">
            <p class="pk-cartPage__count">
              {{ t('cart.itemCount', cart.itemCount, { count: cart.itemCount }) }}
            </p>

            <ul>
              <CartLineItem
                v-for="line in cart.lines"
                :key="line.slug"
                :line="line"
              />
            </ul>

            <div class="pk-cartPage__actions">
              <BaseButton :to="localePath('/produk')" variant="ghost" size="sm" icon="ph:arrow-left-bold">
                {{ t('common.continueShopping') }}
              </BaseButton>

              <button type="button" class="pk-cartPage__clear" @click="confirmClear">
                <Icon name="ph:trash-simple-bold" aria-hidden="true" />
                {{ t('cart.clearCart') }}
              </button>
            </div>

            <p class="pk-cartPage__note">
              {{ t('cart.maxQuantityNote', { max: PRICING_CLIENT.maxQuantityPerLine }) }}
            </p>
          </section>

          <aside class="pk-cartPage__aside">
            <CartSummary />
          </aside>
        </div>

        <EmptyState
          v-else
          :title="t('cart.empty')"
          :body="t('cart.emptyBody')"
          icon="ph:shopping-bag-open-duotone"
        >
          <BaseButton :to="localePath('/produk')" variant="accent">
            {{ t('cart.emptyCta') }}
          </BaseButton>
        </EmptyState>

        <template #fallback>
          <div class="pk-cartPage__grid" aria-busy="true">
            <div class="pk-cartPage__skeleton pk-skeleton" />
            <div class="pk-cartPage__skeleton pk-cartPage__skeleton--aside pk-skeleton" />
          </div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-cartPage__crumbs {
  margin-block-end: var(--pk-space-5);
}

.pk-cartPage__title {
  @include display(30px, 48px);

  color: var(--pk-plum-800);
  margin-block-end: var(--pk-space-7);
}

.pk-cartPage__grid {
  display: grid;
  gap: fluid(24px, 48px);
  grid-template-columns: 1fr;
  align-items: start;

  @include up('lg') {
    grid-template-columns: 1.6fr 0.9fr;
  }
}

.pk-cartPage__lines {
  padding: var(--pk-space-5);

  @include surface(var(--pk-radius-xl), var(--pk-shadow-sm));
}

.pk-cartPage__count {
  color: var(--pk-text-muted);
  font-size: rem(13px);
  font-weight: 700;
  letter-spacing: var(--pk-tracking-wide);
  text-transform: uppercase;
  margin-block-end: var(--pk-space-2);
}

.pk-cartPage__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  padding-block-start: var(--pk-space-4);
  margin-block-start: var(--pk-space-4);
  border-block-start: 1px solid var(--pk-border);
  gap: var(--pk-space-3);
}

.pk-cartPage__clear {
  display: inline-flex;
  align-items: center;
  color: var(--pk-text-muted);
  font-size: rem(13px);
  font-weight: 600;
  gap: 0.4em;

  @include focus-ring(3px);

  @include hover-capable {
    &:hover {
      color: var(--pk-danger);
    }
  }
}

.pk-cartPage__note {
  color: var(--pk-text-subtle);
  font-size: rem(12px);
  margin-block-start: var(--pk-space-3);
}

.pk-cartPage__aside {
  @include up('lg') {
    position: sticky;
    inset-block-start: calc(var(--pk-header-height) + var(--pk-space-5));
  }
}

.pk-cartPage__skeleton {
  min-height: 22rem;
  border-radius: var(--pk-radius-xl);
}

.pk-cartPage__skeleton--aside {
  min-height: 16rem;
}
</style>
