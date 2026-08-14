<script setup lang="ts">
/**
 * The four commitments we can actually keep.
 *
 * This section exists to satisfy the project's honesty rule: instead of the
 * usual "best in town / 10,000 happy customers" block, it lists only things
 * under our own control. Keep it that way — every claim here must be verifiable
 * from the product pages or the compliance policies.
 */

const { t, tm, rt } = useI18n()

const ICONS = [
  'ph:calendar-check-duotone',
  'ph:list-checks-duotone',
  'ph:arrows-clockwise-duotone',
  'ph:package-duotone',
]

interface PromiseItem { title: string, body: string, icon: string }

const items = computed<PromiseItem[]>(() =>
  (tm('home.promise.items') as Record<string, unknown>[]).map((item, index) => ({
    title: rt(item.title as never),
    body: rt(item.body as never),
    icon: ICONS[index % ICONS.length]!,
  })),
)
</script>

<template>
  <section class="pk-promise pk-section">
    <div class="pk-container--wide">
      <div class="pk-promise__panel">
        <span class="pk-promise__wash" aria-hidden="true" />

        <div class="pk-promise__inner">
          <SectionHeading
            class="pk-promise__heading"
            :eyebrow="t('home.promise.eyebrow')"
            :title="t('home.promise.title')"
            :description="t('home.promise.description')"
          />

          <ul v-reveal class="pk-promise__grid pk-stagger">
            <li v-for="item in items" :key="item.title" class="pk-promise__item">
              <Icon :name="item.icon" class="pk-promise__icon" aria-hidden="true" />
              <h3 class="pk-promise__title">
                {{ item.title }}
              </h3>
              <p class="pk-promise__text">
                {{ item.body }}
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-promise__panel {
  position: relative;
  padding: fluid(32px, 72px);
  background: var(--pk-plum-800);
  border-radius: var(--pk-radius-xl);
  color: var(--pk-cream-100);
  overflow: hidden;

  @include grain(0.1, 0);
}

.pk-promise__wash {
  position: absolute;
  background:
    radial-gradient(48% 44% at 88% 8%, rgb(216 154 82 / 34%) 0%, transparent 66%),
    radial-gradient(42% 40% at 4% 96%, rgb(194 74 99 / 26%) 0%, transparent 68%);
  inset: 0;
  pointer-events: none;
}

.pk-promise__inner {
  position: relative;
  z-index: 2;
  display: grid;
  gap: fluid(32px, 56px);
  grid-template-columns: 1fr;

  @include up('lg') {
    grid-template-columns: 0.9fr 1.1fr;
    align-items: start;
  }
}

.pk-promise__heading {
  :deep(.pk-heading__title) {
    color: var(--pk-cream-100);
  }

  :deep(.pk-heading__description) {
    color: var(--pk-plum-100);
  }

  :deep(.pk-heading__eyebrow) {
    color: var(--pk-caramel-300);
  }
}

.pk-promise__grid {
  display: grid;
  gap: var(--pk-space-5);
  grid-template-columns: 1fr;

  @include up('sm') {
    grid-template-columns: repeat(2, 1fr);
  }
}

.pk-promise__item {
  display: flex;
  flex-direction: column;
  padding: var(--pk-space-5);
  border: 1px solid rgb(231 211 224 / 16%);
  background: rgb(255 255 255 / 5%);
  border-radius: var(--pk-radius-lg);
  gap: var(--pk-space-2);
  transition:
    background-color var(--pk-duration-base) var(--pk-ease-out),
    transform var(--pk-duration-base) var(--pk-ease-jelly);

  @include hover-capable {
    &:hover {
      background: rgb(255 255 255 / 10%);
      transform: translateY(-4px);
    }
  }
}

.pk-promise__icon {
  color: var(--pk-caramel-400);
  font-size: rem(28px);
  margin-block-end: var(--pk-space-1);
}

.pk-promise__title {
  font-family: var(--pk-font-display);
  font-size: rem(19px);
  color: var(--pk-cream-100);
}

.pk-promise__text {
  color: var(--pk-plum-100);
  font-size: rem(14px);
  line-height: var(--pk-leading-relaxed);
}
</style>
