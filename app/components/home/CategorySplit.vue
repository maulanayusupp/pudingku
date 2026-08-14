<script setup lang="ts">
import type { CategorySummary, Product } from '#shared/types/catalog'

/**
 * Two large panels, one per product line, each showing its real count and price
 * range from the API. The figures come from data rather than being typed into
 * the copy, so they cannot go stale when the catalog changes.
 */

const props = defineProps<{
  categories: CategorySummary[]
  /** One representative product per category, used for the panel art. */
  covers: Record<string, Product | undefined>
}>()

const { t } = useI18n()
const localePath = useLocalePath()
const { money } = useMoney()

const panels = computed(() =>
  props.categories.map(category => ({
    key: category.key,
    title: t(`categories.${category.key}`),
    description: t(`categories.${category.key}Description`),
    count: t('categories.itemsAvailable', { count: category.count }),
    range: t('categories.priceRange', {
      min: money(category.minPriceIdr),
      max: money(category.maxPriceIdr),
    }),
    cover: props.covers[category.key],
    path: localePath(`/produk?category=${category.key}`),
  })),
)
</script>

<template>
  <section class="pk-split pk-section">
    <div class="pk-container--wide">
      <SectionHeading
        :eyebrow="t('home.categories.eyebrow')"
        :title="t('home.categories.title')"
        :description="t('home.categories.description')"
        align="center"
        narrow
      />

      <div v-reveal class="pk-split__grid pk-stagger">
        <NuxtLink
          v-for="panel in panels"
          :key="panel.key"
          :to="panel.path"
          class="pk-split__panel"
          :class="`pk-split__panel--${panel.key}`"
        >
          <div class="pk-split__art">
            <NuxtImg
              v-if="panel.cover"
              :src="panel.cover.image"
              :alt="''"
              aria-hidden="true"
              width="1000"
              height="1000"
              sizes="(max-width: 768px) 60vw, 320px"
              loading="lazy"
            />
          </div>

          <div class="pk-split__body">
            <h3 class="pk-split__title">
              {{ panel.title }}
            </h3>
            <p class="pk-split__description">
              {{ panel.description }}
            </p>

            <dl class="pk-split__meta">
              <div>
                <dt>{{ t('common.total') }}</dt>
                <dd>{{ panel.count }}</dd>
              </div>
              <div>
                <dt>{{ t('common.from') }}</dt>
                <dd>{{ panel.range }}</dd>
              </div>
            </dl>

            <span class="pk-split__cta">
              {{ t('common.seeAll') }}
              <Icon name="ph:arrow-right-bold" aria-hidden="true" />
            </span>
          </div>
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-split__grid {
  display: grid;
  gap: var(--pk-space-5);
  margin-block-start: var(--pk-space-8);
  grid-template-columns: 1fr;

  @include up('md') {
    grid-template-columns: repeat(2, 1fr);
  }
}

.pk-split__panel {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: var(--pk-space-6);
  border: 1px solid var(--pk-border);
  border-radius: var(--pk-radius-xl);
  overflow: hidden;
  gap: var(--pk-space-5);
  transition:
    transform var(--pk-duration-base) var(--pk-ease-jelly),
    box-shadow var(--pk-duration-base) var(--pk-ease-out);

  @include focus-ring(4px);

  @include hover-capable {
    &:hover {
      box-shadow: var(--pk-shadow-lg);
      transform: translateY(-6px);
    }

    &:hover .pk-split__art img {
      transform: scale(1.08) rotate(4deg);
    }

    &:hover .pk-split__cta > svg {
      transform: translateX(5px);
    }
  }

  @include up('sm') {
    flex-direction: row;
    align-items: center;
  }
}

.pk-split__panel--pudding {
  background: linear-gradient(150deg, var(--pk-caramel-100), var(--pk-cream-100) 62%);
}

.pk-split__panel--cake {
  background: linear-gradient(150deg, #f3e6ef, var(--pk-cream-100) 62%);
}

.pk-split__art {
  flex-shrink: 0;
  width: clamp(7rem, 34%, 11rem);
  aspect-ratio: 1;
  border-radius: var(--pk-radius-blob);
  overflow: hidden;
  box-shadow: var(--pk-shadow-md);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform var(--pk-duration-slow) var(--pk-ease-out);
  }

  @include motion-safe {
    animation: pk-blob-morph 13s var(--pk-ease-in-out) infinite;
  }
}

.pk-split__body {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: var(--pk-space-3);
}

.pk-split__title {
  font-family: var(--pk-font-display);
  font-size: fluid(24px, 32px);
  color: var(--pk-plum-800);
}

.pk-split__description {
  color: var(--pk-text-muted);
  font-size: rem(14.5px);
  line-height: var(--pk-leading-normal);
}

.pk-split__meta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--pk-space-5);
  padding-block-start: var(--pk-space-3);
  border-block-start: 1px dashed var(--pk-border-strong);

  dt {
    color: var(--pk-text-subtle);
    font-size: rem(11px);
    font-weight: 700;
    letter-spacing: var(--pk-tracking-wide);
    text-transform: uppercase;
  }

  dd {
    color: var(--pk-plum-700);
    font-size: rem(14px);
    font-weight: 700;
  }
}

.pk-split__cta {
  display: inline-flex;
  align-items: center;
  color: var(--pk-caramel-700);
  font-size: rem(14px);
  font-weight: 800;
  gap: 0.4em;

  > svg {
    transition: transform var(--pk-duration-base) var(--pk-ease-out);
  }
}
</style>
