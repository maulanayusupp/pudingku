<script setup lang="ts">
import { useCartStore } from '~/stores/cart'
import { PRICING_CLIENT } from '~/constants/pricing'
import { leadTimeParts } from '~/utils/format'

/**
 * Product detail.
 *
 * Emits `Product` structured data built from the same values the page shows, so
 * the rich result can never advertise a price the page does not display.
 * Availability is mapped honestly: this build takes orders by arrangement, so
 * the schema says `PreOrder` rather than `InStock`.
 */

const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const { money, weight } = useMoney()
const { badgeIcon, badgeLabel } = useAllergens()
const cart = useCartStore()
const config = useRuntimeConfig()

const slug = computed(() => String(route.params.slug))

const { data, error } = await useProductDetail(slug)

if (error.value || !data.value?.product) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Product not found',
    fatal: true,
  })
}

const product = computed(() => data.value!.product)
const related = computed(() => data.value?.related ?? [])

const quantity = ref(1)

const leadTime = computed(() => {
  const { unit, count } = leadTimeParts(product.value.leadTimeHours)
  return unit === 'hour'
    ? t('units.leadTimeHours', count, { count })
    : t('units.leadTimeDays', count, { count })
})

const addToCart = () => {
  cart.add(product.value, quantity.value)
  cart.openDrawer()
}

const details = computed(() => [
  { label: t('product.unit'), value: product.value.unit },
  { label: t('product.servings'), value: t('units.servingsCount', product.value.servings, { count: product.value.servings }) },
  { label: t('product.netWeight'), value: weight(product.value.netWeightGram) },
  { label: t('product.leadTime'), value: leadTime.value },
])

const siteUrl = String(config.public.siteUrl).replace(/\/$/, '')

useSeoPage(() => ({
  title: `${product.value.name} — ${t(`categories.${product.value.category}`)}`,
  description: product.value.tagline,
  image: product.value.image,
  type: 'product',
}))

useSchemaOrg([
  defineProduct({
    name: () => product.value.name,
    description: () => product.value.description,
    image: () => `${siteUrl}${product.value.image}`,
    sku: () => product.value.id,
    category: () => t(`categories.${product.value.category}`),
    offers: [{
      price: () => product.value.priceIdr,
      priceCurrency: 'IDR',
      // Everything is made to order in this build; `PreOrder` is the accurate
      // availability value, not `InStock`.
      availability: () => (product.value.available
        ? 'https://schema.org/PreOrder'
        : 'https://schema.org/OutOfStock'),
      url: () => `${siteUrl}${localePath(`/produk/${product.value.slug}`)}`,
    }],
  }),
])
</script>

<template>
  <article class="pk-product">
    <div class="pk-container--wide">
      <BreadcrumbTrail
        class="pk-product__crumbs"
        :items="[
          { label: t('nav.home'), to: localePath('/') },
          { label: t('nav.products'), to: localePath('/produk') },
          { label: product.name },
        ]"
      />
    </div>

    <div class="pk-container--wide pk-product__main">
      <div class="pk-product__media">
        <div class="pk-product__frame">
          <ProductImage
            :src="product.image"
            :alt="t('a11y.productImage', { name: product.name })"
            loading="eager"
            preload
          />
        </div>

        <ul v-if="product.badges.length" class="pk-product__badges">
          <li v-for="badge in product.badges" :key="badge">
            <BaseBadge tone="accent" :icon="badgeIcon(badge)">
              {{ badgeLabel(badge) }}
            </BaseBadge>
          </li>
        </ul>
      </div>

      <div class="pk-product__info">
        <p class="pk-product__category">
          {{ t(`categories.${product.category}`) }}
        </p>

        <h1 class="pk-product__title">
          {{ product.name }}
        </h1>

        <p class="pk-product__tagline">
          {{ product.tagline }}
        </p>

        <div class="pk-product__priceRow">
          <p class="pk-product__price">
            {{ money(product.priceIdr) }}
            <span class="pk-product__unit">{{ product.unit }}</span>
          </p>
          <BaseBadge tone="neutral" size="xs" icon="ph:clock-duotone">
            {{ leadTime }}
          </BaseBadge>
        </div>

        <p class="pk-product__priceNote">
          {{ t('product.priceNote') }}
        </p>

        <div v-if="product.available" class="pk-product__buy">
          <QuantityStepper
            v-model="quantity"
            :max="PRICING_CLIENT.maxQuantityPerLine"
            :label="`${t('product.quantityLabel')} — ${product.name}`"
          />

          <BaseButton variant="accent" size="lg" icon="ph:shopping-bag-duotone" @click="addToCart">
            {{ t('common.addToCart') }}
          </BaseButton>
        </div>

        <BaseNotice v-else tone="warning" :title="t('product.unavailable')">
          {{ t('product.unavailableBody') }}
        </BaseNotice>

        <div class="pk-product__description">
          <p>{{ product.description }}</p>
        </div>

        <section v-if="product.highlights.length" class="pk-product__block">
          <h2 class="pk-product__blockTitle">
            {{ t('product.highlights') }}
          </h2>
          <ul class="pk-product__highlights">
            <li v-for="item in product.highlights" :key="item">
              <Icon name="ph:check-circle-duotone" aria-hidden="true" />
              {{ item }}
            </li>
          </ul>
        </section>

        <section class="pk-product__block">
          <h2 class="pk-product__blockTitle">
            {{ t('product.details') }}
          </h2>
          <dl class="pk-product__details">
            <div v-for="detail in details" :key="detail.label">
              <dt>{{ detail.label }}</dt>
              <dd>{{ detail.value }}</dd>
            </div>
          </dl>
        </section>

        <section class="pk-product__block">
          <h2 class="pk-product__blockTitle">
            {{ t('product.ingredients') }}
          </h2>
          <ul class="pk-product__ingredients">
            <li v-for="item in product.ingredients" :key="item">
              {{ item }}
            </li>
          </ul>
        </section>

        <section class="pk-product__block">
          <h2 class="pk-product__blockTitle">
            {{ t('product.allergenInfo') }}
          </h2>
          <AllergenList :allergens="product.allergens" />
        </section>

        <section class="pk-product__block">
          <h2 class="pk-product__blockTitle">
            {{ t('product.storage') }}
          </h2>
          <p class="pk-product__storage">
            <Icon name="ph:thermometer-cold-duotone" aria-hidden="true" />
            {{ product.storage }}
          </p>
        </section>
      </div>
    </div>

    <section v-if="related.length" class="pk-product__related pk-section">
      <div class="pk-container--wide">
        <SectionHeading :title="t('product.related')" />

        <div v-reveal class="pk-product__relatedGrid pk-stagger">
          <ProductCard
            v-for="item in related"
            :key="item.id"
            :product="item"
          />
        </div>
      </div>
    </section>
  </article>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-product {
  padding-block-start: fluid(20px, 40px);
}

.pk-product__crumbs {
  margin-block-end: var(--pk-space-5);
}

.pk-product__main {
  display: grid;
  gap: fluid(28px, 64px);
  grid-template-columns: 1fr;
  align-items: start;

  @include up('lg') {
    grid-template-columns: 0.95fr 1.05fr;
  }
}

// ── Media ────────────────────────────────────────────────────────────────────

.pk-product__media {
  display: flex;
  flex-direction: column;
  gap: var(--pk-space-4);

  @include up('lg') {
    position: sticky;
    inset-block-start: calc(var(--pk-header-height) + var(--pk-space-5));
  }
}

.pk-product__frame {
  position: relative;
  overflow: hidden;
  background: linear-gradient(160deg, var(--pk-cream-100), var(--pk-cream-200));
  border: 1px solid var(--pk-border);
  border-radius: var(--pk-radius-xl);
  box-shadow: var(--pk-shadow-md);

  img {
    width: 100%;
    aspect-ratio: 1;
    object-fit: cover;
  }
}

.pk-product__badges {
  display: flex;
  flex-wrap: wrap;
  gap: var(--pk-space-2);
}

// ── Info ─────────────────────────────────────────────────────────────────────

.pk-product__info {
  display: flex;
  flex-direction: column;
  gap: var(--pk-space-4);
  padding-block-end: fluid(32px, 56px);
}

.pk-product__category {
  @include eyebrow;

  color: var(--pk-caramel-700);
}

.pk-product__title {
  @include display(30px, 54px);

  color: var(--pk-plum-800);
}

.pk-product__tagline {
  max-width: 52ch;
  color: var(--pk-ink-700);
  font-size: fluid(16px, 19px);
  line-height: var(--pk-leading-relaxed);
}

.pk-product__priceRow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--pk-space-4);
  padding-block-start: var(--pk-space-4);
  border-block-start: 1px dashed var(--pk-border-strong);
}

.pk-product__price {
  display: flex;
  flex-direction: column;
  color: var(--pk-plum-800);
  font-size: fluid(26px, 34px);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}

.pk-product__unit {
  color: var(--pk-text-muted);
  font-size: rem(13px);
  font-weight: 500;
}

.pk-product__priceNote {
  color: var(--pk-text-subtle);
  font-size: rem(12.5px);
}

.pk-product__buy {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--pk-space-3);
  padding-block: var(--pk-space-2);
}

.pk-product__description {
  color: var(--pk-text-muted);
  font-size: rem(15.5px);
  line-height: var(--pk-leading-relaxed);
  max-width: 62ch;
}

.pk-product__block {
  display: flex;
  flex-direction: column;
  padding-block-start: var(--pk-space-5);
  border-block-start: 1px solid var(--pk-border);
  gap: var(--pk-space-3);
}

.pk-product__blockTitle {
  @include eyebrow;

  color: var(--pk-plum-700);
}

.pk-product__highlights {
  display: flex;
  flex-direction: column;
  gap: var(--pk-space-2);

  li {
    display: flex;
    align-items: flex-start;
    color: var(--pk-ink-700);
    font-size: rem(15px);
    gap: 0.5em;
  }

  svg {
    flex-shrink: 0;
    margin-block-start: 0.15em;
    color: var(--pk-success);
    font-size: 1.15em;
  }
}

.pk-product__details {
  display: grid;
  gap: var(--pk-space-3);
  grid-template-columns: repeat(2, 1fr);

  @include up('sm') {
    grid-template-columns: repeat(4, 1fr);
  }

  dt {
    color: var(--pk-text-subtle);
    font-size: rem(11px);
    font-weight: 700;
    letter-spacing: var(--pk-tracking-wide);
    text-transform: uppercase;
  }

  dd {
    color: var(--pk-ink-700);
    font-size: rem(14px);
    font-weight: 700;
    margin-block-start: 2px;
  }
}

.pk-product__ingredients {
  display: flex;
  flex-wrap: wrap;
  gap: var(--pk-space-2);

  li {
    padding: 0.4rem 0.75rem;
    border: 1px solid var(--pk-border);
    background: var(--pk-cream-100);
    border-radius: var(--pk-radius-pill);
    color: var(--pk-ink-700);
    font-size: rem(13px);
  }
}

.pk-product__storage {
  display: flex;
  align-items: flex-start;
  color: var(--pk-text-muted);
  font-size: rem(14px);
  gap: 0.5em;
  line-height: var(--pk-leading-normal);

  svg {
    flex-shrink: 0;
    margin-block-start: 0.15em;
    color: var(--pk-plum-500);
    font-size: 1.2em;
  }
}

// ── Related ──────────────────────────────────────────────────────────────────

.pk-product__related {
  background: var(--pk-cream-50);
  border-block-start: 1px solid var(--pk-border);
}

.pk-product__relatedGrid {
  @include auto-grid(240px, var(--pk-space-5));

  margin-block-start: var(--pk-space-6);
}
</style>
