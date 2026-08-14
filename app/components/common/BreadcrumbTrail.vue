<script setup lang="ts">
/**
 * Breadcrumbs with matching `BreadcrumbList` structured data.
 *
 * Emitting the schema from the same source as the visible trail is what keeps
 * the two from drifting apart — a common cause of rich-result warnings.
 */

export interface Crumb {
  label: string
  /** Already localized path; omit on the current page. */
  to?: string
}

const props = defineProps<{ items: Crumb[] }>()

const { t } = useI18n()
const config = useRuntimeConfig()
const siteUrl = String(config.public.siteUrl).replace(/\/$/, '')

useSchemaOrg([
  defineBreadcrumb({
    itemListElement: props.items.map(item => ({
      name: item.label,
      item: item.to ? `${siteUrl}${item.to}` : undefined,
    })),
  }),
])
</script>

<template>
  <nav class="pk-crumbs" :aria-label="t('a11y.breadcrumb')">
    <ol class="pk-crumbs__list">
      <li v-for="(item, index) in items" :key="item.label" class="pk-crumbs__item">
        <NuxtLink v-if="item.to" :to="item.to" class="pk-crumbs__link">
          {{ item.label }}
        </NuxtLink>
        <span v-else class="pk-crumbs__current" aria-current="page">{{ item.label }}</span>

        <Icon
          v-if="index < items.length - 1"
          name="ph:caret-right-bold"
          class="pk-crumbs__separator"
          aria-hidden="true"
        />
      </li>
    </ol>
  </nav>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-crumbs__list {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
  font-size: rem(13px);
}

.pk-crumbs__item {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.pk-crumbs__link {
  color: var(--pk-text-muted);
  font-weight: 600;
  transition: color var(--pk-duration-fast) var(--pk-ease-out);

  @include focus-ring(2px);

  @include hover-capable {
    &:hover {
      color: var(--pk-plum-700);
    }
  }
}

.pk-crumbs__current {
  color: var(--pk-plum-700);
  font-weight: 700;
}

.pk-crumbs__separator {
  color: var(--pk-text-subtle);
  font-size: rem(10px);
}
</style>
