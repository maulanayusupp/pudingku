<script setup lang="ts">
/** Closing call to action, reused at the bottom of several pages. */

interface Props {
  eyebrow?: string
  title: string
  description?: string
  primaryLabel: string
  primaryTo: string
  secondaryLabel?: string
  secondaryTo?: string
}

defineProps<Props>()
</script>

<template>
  <section class="pk-cta pk-section">
    <div class="pk-container">
      <div v-reveal class="pk-cta__panel">
        <span class="pk-cta__blob pk-cta__blob--a" aria-hidden="true" />
        <span class="pk-cta__blob pk-cta__blob--b" aria-hidden="true" />

        <div class="pk-cta__content">
          <p v-if="eyebrow" class="pk-cta__eyebrow">
            {{ eyebrow }}
          </p>

          <h2 class="pk-cta__title">
            {{ title }}
          </h2>

          <p v-if="description" class="pk-cta__description">
            {{ description }}
          </p>

          <div class="pk-cta__actions">
            <BaseButton :to="primaryTo" variant="primary" size="lg" icon-trailing="ph:arrow-right-bold">
              {{ primaryLabel }}
            </BaseButton>
            <BaseButton v-if="secondaryTo && secondaryLabel" :to="secondaryTo" variant="outline" size="lg">
              {{ secondaryLabel }}
            </BaseButton>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-cta__panel {
  position: relative;
  padding: fluid(40px, 80px) fluid(24px, 64px);
  border: 1px solid var(--pk-caramel-300);
  background: linear-gradient(140deg, var(--pk-caramel-100), var(--pk-cream-100) 58%, #f6e5ee);
  border-radius: var(--pk-radius-xl);
  overflow: hidden;
  text-align: center;
}

.pk-cta__blob {
  position: absolute;
  border-radius: var(--pk-radius-blob);
  filter: blur(4px);
  opacity: 0.42;

  @include motion-safe {
    animation: pk-blob-morph 16s var(--pk-ease-in-out) infinite;
  }
}

.pk-cta__blob--a {
  width: 16rem;
  aspect-ratio: 1;
  background: radial-gradient(circle, var(--pk-caramel-400), transparent 70%);
  inset-block-start: -5rem;
  inset-inline-start: -4rem;
}

.pk-cta__blob--b {
  width: 20rem;
  aspect-ratio: 1;
  background: radial-gradient(circle, rgb(194 74 99 / 60%), transparent 70%);
  inset-block-end: -7rem;
  inset-inline-end: -5rem;
  animation-direction: reverse;
}

.pk-cta__content {
  position: relative;
  z-index: 2;
  display: flex;
  max-width: 44rem;
  flex-direction: column;
  align-items: center;
  gap: var(--pk-space-4);
  margin-inline: auto;
}

.pk-cta__eyebrow {
  @include eyebrow;

  color: var(--pk-caramel-700);
}

.pk-cta__title {
  @include display(28px, 52px);

  color: var(--pk-plum-800);
}

.pk-cta__description {
  max-width: 46ch;
  color: var(--pk-ink-700);
  font-size: fluid(15px, 17px);
  line-height: var(--pk-leading-relaxed);
}

.pk-cta__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--pk-space-3);
  margin-block-start: var(--pk-space-2);
}
</style>
