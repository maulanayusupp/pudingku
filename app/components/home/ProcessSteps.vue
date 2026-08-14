<script setup lang="ts">
/**
 * The four production steps, rendered as a numbered path.
 *
 * Content comes from `home.process.steps` in the locale files, so adding a
 * fifth step is a translation change rather than a template change.
 */

const { t, tm, rt } = useI18n()

interface Step { title: string, body: string }

const steps = computed<Step[]>(() =>
  (tm('home.process.steps') as Record<string, unknown>[]).map(step => ({
    title: rt(step.title as never),
    body: rt(step.body as never),
  })),
)
</script>

<template>
  <section class="pk-process pk-section">
    <div class="pk-container">
      <SectionHeading
        :eyebrow="t('home.process.eyebrow')"
        :title="t('home.process.title')"
      />

      <ol v-reveal class="pk-process__list pk-stagger">
        <li v-for="(step, index) in steps" :key="step.title" class="pk-process__step">
          <span class="pk-process__number" aria-hidden="true">
            {{ String(index + 1).padStart(2, '0') }}
          </span>

          <div class="pk-process__body">
            <h3 class="pk-process__title">
              {{ step.title }}
            </h3>
            <p class="pk-process__text">
              {{ step.body }}
            </p>
          </div>
        </li>
      </ol>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-process__list {
  display: grid;
  gap: var(--pk-space-5);
  margin-block-start: var(--pk-space-8);
  grid-template-columns: 1fr;

  @include up('sm') {
    grid-template-columns: repeat(2, 1fr);
  }

  @include up('lg') {
    grid-template-columns: repeat(4, 1fr);
  }
}

.pk-process__step {
  position: relative;
  display: flex;
  flex-direction: column;
  padding: var(--pk-space-5);
  border: 1px solid var(--pk-border);
  background: var(--pk-bg-raised);
  border-radius: var(--pk-radius-lg);
  gap: var(--pk-space-3);
  transition:
    transform var(--pk-duration-base) var(--pk-ease-jelly),
    border-color var(--pk-duration-base) var(--pk-ease-out);

  @include hover-capable {
    &:hover {
      border-color: var(--pk-caramel-400);
      transform: translateY(-4px);
    }
  }

  /// A connecting dash between cards on wide screens.
  @include up('lg') {
    &:not(:last-child)::after {
      position: absolute;
      width: var(--pk-space-5);
      border-block-start: 2px dashed var(--pk-caramel-400);
      content: '';
      inset-block-start: calc(var(--pk-space-5) + 1.35rem);
      inset-inline-end: calc(var(--pk-space-5) * -1);
    }
  }
}

.pk-process__number {
  display: grid;
  width: 2.7rem;
  height: 2.7rem;
  background: var(--pk-plum-600);
  border-radius: var(--pk-radius-blob);
  color: var(--pk-caramel-300);
  font-family: var(--pk-font-display);
  font-size: rem(15px);
  font-weight: 700;
  place-items: center;

  @include motion-safe {
    animation: pk-blob-morph 10s var(--pk-ease-in-out) infinite;
  }
}

.pk-process__body {
  display: flex;
  flex-direction: column;
  gap: var(--pk-space-2);
}

.pk-process__title {
  font-family: var(--pk-font-display);
  font-size: rem(20px);
  color: var(--pk-plum-800);
}

.pk-process__text {
  color: var(--pk-text-muted);
  font-size: rem(14px);
  line-height: var(--pk-leading-relaxed);
}
</style>
