<script setup lang="ts">
import type { CatalogFilters } from '~/composables/useCatalog'
import type { ProductCategory, ProductSort } from '#shared/types/catalog'

/**
 * Filter bar for the shop page: category pills, a search box and a sort select.
 *
 * Search is debounced so typing does not fire a request per keystroke, and the
 * category pills are real radio inputs so arrow keys move between them the way
 * a keyboard user expects.
 */

const filters = defineModel<CatalogFilters>({ required: true })

const { t } = useI18n()

const CATEGORIES: (ProductCategory | 'all')[] = ['all', 'pudding', 'cake']

const SORTS: { value: ProductSort, labelKey: string }[] = [
  { value: 'featured', labelKey: 'sort.featured' },
  { value: 'price-asc', labelKey: 'sort.priceAsc' },
  { value: 'price-desc', labelKey: 'sort.priceDesc' },
  { value: 'name-asc', labelKey: 'sort.nameAsc' },
]

const sortOptions = computed(() =>
  SORTS.map(item => ({ value: item.value, label: t(item.labelKey) })),
)

/** Local mirror of the search box so the debounce does not fight v-model. */
const searchTerm = ref(filters.value.q)
const debouncedTerm = useDebounce(searchTerm, 280)

watch(debouncedTerm, (value) => {
  if (value === filters.value.q) return
  filters.value = { ...filters.value, q: value }
})

// Keep the box in sync when filters are reset from outside.
watch(() => filters.value.q, (value) => {
  if (value !== searchTerm.value) searchTerm.value = value
})

const sortModel = computed({
  get: () => filters.value.sort,
  set: (value: string) => {
    filters.value = { ...filters.value, sort: value as ProductSort }
  },
})

const selectCategory = (category: ProductCategory | 'all') => {
  filters.value = { ...filters.value, category }
}

const clearSearch = () => { searchTerm.value = '' }
</script>

<template>
  <div class="pk-filters">
    <fieldset class="pk-filters__categories">
      <legend class="pk-sr-only">
        {{ t('products.filterByCategory') }}
      </legend>

      <label
        v-for="category in CATEGORIES"
        :key="category"
        class="pk-filters__pill"
        :class="{ 'is-active': filters.category === category }"
      >
        <input
          class="pk-sr-only"
          type="radio"
          name="pk-category"
          :value="category"
          :checked="filters.category === category"
          @change="selectCategory(category)"
        >
        <span>{{ t(`categories.${category}`) }}</span>
      </label>
    </fieldset>

    <div class="pk-filters__tools">
      <div class="pk-filters__search">
        <BaseInput
          v-model="searchTerm"
          type="search"
          icon="ph:magnifying-glass-bold"
          :placeholder="t('common.searchPlaceholder')"
          :aria-label="t('common.search')"
        />
        <button
          v-if="searchTerm"
          type="button"
          class="pk-filters__clear"
          :aria-label="t('common.clear')"
          @click="clearSearch"
        >
          <Icon name="ph:x-bold" aria-hidden="true" />
        </button>
      </div>

      <BaseSelect
        v-model="sortModel"
        class="pk-filters__sort"
        :options="sortOptions"
        :aria-label="t('sort.label')"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-filters {
  display: flex;
  flex-direction: column;
  gap: var(--pk-space-4);

  @include up('lg') {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.pk-filters__categories {
  display: flex;
  flex-wrap: wrap;
  padding: 0;
  border: 0;
  gap: var(--pk-space-2);
}

.pk-filters__pill {
  padding: 0.6rem 1.15rem;
  border: 1px solid var(--pk-border);
  background: var(--pk-bg-raised);
  border-radius: var(--pk-radius-pill);
  color: var(--pk-ink-700);
  font-size: rem(14px);
  font-weight: 700;
  cursor: pointer;
  transition:
    background-color var(--pk-duration-fast) var(--pk-ease-out),
    border-color var(--pk-duration-fast) var(--pk-ease-out),
    color var(--pk-duration-fast) var(--pk-ease-out),
    transform var(--pk-duration-base) var(--pk-ease-jelly);

  &:has(:focus-visible) {
    outline: 2px solid var(--pk-focus);
    outline-offset: 3px;
  }

  @include hover-capable {
    &:hover {
      border-color: var(--pk-caramel-400);
      background: var(--pk-caramel-100);
    }
  }

  &.is-active {
    border-color: transparent;
    background: var(--pk-plum-600);
    color: var(--pk-cream-100);
    transform: scale(1.03);
  }
}

.pk-filters__tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--pk-space-3);
}

.pk-filters__search {
  position: relative;
  flex: 1;
  min-width: 15rem;
}

.pk-filters__clear {
  position: absolute;
  display: grid;
  width: 1.6rem;
  height: 1.6rem;
  background: var(--pk-cream-200);
  border-radius: var(--pk-radius-pill);
  color: var(--pk-ink-700);
  font-size: rem(11px);
  inset-block-start: 50%;
  inset-inline-end: var(--pk-space-3);
  place-items: center;
  transform: translateY(-50%);

  @include focus-ring(2px);
}

.pk-filters__sort {
  min-width: 12rem;
}
</style>
