<script setup lang="ts">
import type { CatalogFilters } from '~/composables/useCatalog'
import type { ProductCategory, ProductSort } from '#shared/types/catalog'

/**
 * Shop page.
 *
 * Filters live in the URL query so a filtered view can be linked and shared,
 * survives a reload, and shows up correctly in analytics later. The router is
 * updated with `replace` so filtering does not fill the browser's back stack.
 */

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const router = useRouter()

const VALID_CATEGORIES: (ProductCategory | 'all')[] = ['all', 'pudding', 'cake']
const VALID_SORTS: ProductSort[] = ['featured', 'price-asc', 'price-desc', 'name-asc']

const readQuery = (): CatalogFilters => {
  const category = String(route.query.category ?? 'all')
  const sort = String(route.query.sort ?? 'featured')
  return {
    category: VALID_CATEGORIES.includes(category as never) ? (category as ProductCategory | 'all') : 'all',
    sort: VALID_SORTS.includes(sort as never) ? (sort as ProductSort) : 'featured',
    q: String(route.query.q ?? ''),
  }
}

const filters = ref<CatalogFilters>(readQuery())

watch(filters, (value) => {
  router.replace({
    query: {
      ...(value.category !== 'all' ? { category: value.category } : {}),
      ...(value.sort !== 'featured' ? { sort: value.sort } : {}),
      ...(value.q ? { q: value.q } : {}),
    },
  })
}, { deep: true })

// Back/forward navigation must move the controls, not just the URL.
watch(() => route.query, () => {
  const next = readQuery()
  if (JSON.stringify(next) !== JSON.stringify(filters.value)) filters.value = next
})

const { data, pending } = await useProductList(filters)

const items = computed(() => data.value?.items ?? [])
const hasResults = computed(() => items.value.length > 0)

const resetFilters = () => {
  filters.value = { category: 'all', sort: 'featured', q: '' }
}

useSeoPage(() => ({
  title: t('products.meta.title'),
  description: t('products.meta.description'),
}))
</script>

<template>
  <div class="pk-shop">
    <header class="pk-shop__head">
      <div class="pk-container--wide">
        <BreadcrumbTrail
          class="pk-shop__crumbs"
          :items="[
            { label: t('nav.home'), to: localePath('/') },
            { label: t('nav.products') },
          ]"
        />

        <SectionHeading
          :eyebrow="t('products.eyebrow')"
          :title="t('products.title')"
          :description="t('products.description')"
          level="2"
        />
      </div>
    </header>

    <div class="pk-container--wide pk-shop__body">
      <ProductFilters v-model="filters" class="pk-shop__filters" />

      <p class="pk-shop__count" role="status">
        <span v-if="!pending">{{ t('products.resultCount', items.length, { count: items.length }) }}</span>
        <span v-else>{{ t('products.loadingLabel') }}</span>
      </p>

      <ProductGrid
        v-if="hasResults || pending"
        :items="items"
        :pending="pending"
        :skeleton-count="8"
      />

      <EmptyState
        v-else
        :title="t('products.emptyTitle')"
        :body="t('products.emptyBody')"
        icon="ph:magnifying-glass-duotone"
      >
        <BaseButton variant="outline" size="sm" @click="resetFilters">
          {{ t('common.reset') }}
        </BaseButton>
      </EmptyState>
    </div>

    <CtaBanner
      :eyebrow="t('home.cta.eyebrow')"
      :title="t('home.cta.title')"
      :description="t('home.cta.description')"
      :primary-label="t('nav.cart')"
      :primary-to="localePath('/keranjang')"
      :secondary-label="t('home.cta.secondary')"
      :secondary-to="localePath('/kontak')"
    />
  </div>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-shop__head {
  padding-block: fluid(28px, 56px) fluid(28px, 44px);
  background:
    radial-gradient(56% 48% at 84% 10%, rgb(240 201 144 / 44%) 0%, transparent 66%),
    var(--pk-cream-100);
}

.pk-shop__crumbs {
  margin-block-end: var(--pk-space-5);
}

.pk-shop__body {
  padding-block-end: fluid(48px, 80px);
}

.pk-shop__filters {
  padding-block: var(--pk-space-5);
  border-block-end: 1px solid var(--pk-border);
  margin-block-end: var(--pk-space-5);
}

.pk-shop__count {
  color: var(--pk-text-muted);
  font-size: rem(13.5px);
  font-weight: 600;
  margin-block-end: var(--pk-space-5);
}
</style>
