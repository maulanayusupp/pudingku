<script setup lang="ts">
import type { Product } from '#shared/types/catalog'

/**
 * Home hero.
 *
 * The composition is a stack of three product illustrations that drift apart on
 * pointer move — a cheap effect that reads as depth without a canvas or a
 * physics library. The parallax composable writes `--pk-px` / `--pk-py` onto the
 * stage and the SCSS decides how far each layer travels, so the maths stays in
 * one place and no inline style ever reaches the markup.
 */

const props = defineProps<{
  /** Three products whose art is used for the stacked composition. */
  showcase: Product[]
}>()

const { t } = useI18n()
const localePath = useLocalePath()

const stage = ref<HTMLElement | null>(null)
usePointerParallax(stage, 1)

const layers = computed(() => props.showcase.slice(0, 3))

const stats = computed(() => [
  { value: '10', label: t('home.hero.statVariants') },
  { value: '6', label: t('home.hero.statCakes') },
  { value: '1', label: t('home.hero.statBatch') },
])
</script>

<template>
  <section class="pk-hero">
    <div class="pk-hero__wash" aria-hidden="true" />

    <div class="pk-hero__inner pk-container--wide">
      <div class="pk-hero__copy">
        <p class="pk-hero__eyebrow">
          <span class="pk-hero__pulse" aria-hidden="true" />
          {{ t('home.hero.eyebrow') }}
        </p>

        <h1 class="pk-hero__title">
          {{ t('home.hero.title') }}
        </h1>

        <p class="pk-hero__subtitle">
          {{ t('home.hero.subtitle') }}
        </p>

        <div class="pk-hero__actions">
          <BaseButton :to="localePath('/produk')" variant="accent" size="lg" icon-trailing="ph:arrow-right-bold">
            {{ t('home.hero.ctaPrimary') }}
          </BaseButton>
          <BaseButton :to="localePath('/tentang')" variant="outline" size="lg">
            {{ t('home.hero.ctaSecondary') }}
          </BaseButton>
        </div>

        <dl class="pk-hero__stats">
          <div v-for="stat in stats" :key="stat.label" class="pk-hero__stat">
            <dt class="pk-hero__statValue">
              {{ stat.value }}
            </dt>
            <dd class="pk-hero__statLabel">
              {{ stat.label }}
            </dd>
          </div>
        </dl>
      </div>

      <div ref="stage" class="pk-hero__stage">
        <div
          v-for="(product, index) in layers"
          :key="product.id"
          class="pk-hero__layer"
          :class="`pk-hero__layer--${index + 1}`"
        >
          <NuxtImg
            :src="product.image"
            :alt="index === 0 ? t('a11y.productImage', { name: product.name }) : ''"
            :aria-hidden="index === 0 ? undefined : 'true'"
            width="1000"
            height="1000"
            sizes="(max-width: 768px) 70vw, 460px"
            :loading="index === 0 ? 'eager' : 'lazy'"
            :preload="index === 0"
          />
        </div>

        <span class="pk-hero__ring" aria-hidden="true" />
      </div>
    </div>

    <p class="pk-hero__scroll" aria-hidden="true">
      <Icon name="ph:arrow-down-bold" />
      {{ t('common.scrollForMore') }}
    </p>
  </section>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-hero {
  position: relative;
  overflow: hidden;
  padding-block: fluid(40px, 88px) fluid(56px, 96px);

  @include grain(0.05, 0);
}

/// Layered radial washes standing in for a photographic backdrop.
.pk-hero__wash {
  position: absolute;
  background:
    radial-gradient(58% 48% at 78% 22%, rgb(240 201 144 / 62%) 0%, transparent 62%),
    radial-gradient(52% 44% at 12% 76%, rgb(194 74 99 / 22%) 0%, transparent 64%),
    radial-gradient(70% 62% at 50% -10%, rgb(75 27 57 / 12%) 0%, transparent 70%);
  inset: 0;
  pointer-events: none;
}

.pk-hero__inner {
  position: relative;
  z-index: 2;
  display: grid;
  align-items: center;
  gap: fluid(32px, 64px);
  grid-template-columns: 1fr;

  @include up('lg') {
    grid-template-columns: 1.02fr 0.98fr;
  }
}

.pk-hero__copy {
  display: flex;
  flex-direction: column;
  gap: var(--pk-space-5);
}

.pk-hero__eyebrow {
  @include eyebrow;

  display: inline-flex;
  align-self: flex-start;
  align-items: center;
  padding: 0.5rem 0.9rem;
  border: 1px solid var(--pk-caramel-300);
  background: rgb(255 255 255 / 62%);
  border-radius: var(--pk-radius-pill);
  color: var(--pk-plum-700);
  gap: 0.55em;
}

.pk-hero__pulse {
  width: 8px;
  height: 8px;
  background: var(--pk-berry);
  border-radius: 50%;

  @include motion-safe {
    animation: pk-float 2.6s var(--pk-ease-in-out) infinite;
  }
}

.pk-hero__title {
  @include display(38px, 78px);

  color: var(--pk-plum-800);
  max-width: 16ch;
}

.pk-hero__subtitle {
  max-width: 52ch;
  color: var(--pk-ink-700);
  font-size: fluid(16px, 19px);
  line-height: var(--pk-leading-relaxed);
}

.pk-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--pk-space-3);
}

.pk-hero__stats {
  display: flex;
  flex-wrap: wrap;
  padding-block-start: var(--pk-space-5);
  border-block-start: 1px dashed var(--pk-border-strong);
  gap: fluid(20px, 44px);
}

.pk-hero__stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pk-hero__statValue {
  font-family: var(--pk-font-display);
  font-size: fluid(28px, 40px);
  font-weight: 700;
  color: var(--pk-caramel-700);
  line-height: 1;
}

.pk-hero__statLabel {
  color: var(--pk-text-muted);
  font-size: rem(13px);
  max-width: 12ch;
}

// ── Stage ────────────────────────────────────────────────────────────────────

.pk-hero__stage {
  position: relative;
  aspect-ratio: 1 / 1;
  width: 100%;
  max-width: 33rem;
  margin-inline: auto;
}

.pk-hero__ring {
  position: absolute;
  border: 1px dashed var(--pk-caramel-400);
  border-radius: 50%;
  inset: 4%;
  opacity: 0.55;

  @include motion-safe {
    animation: pk-spin-slow 44s linear infinite;
  }
}

.pk-hero__layer {
  position: absolute;
  overflow: hidden;
  border-radius: var(--pk-radius-blob);
  box-shadow: var(--pk-shadow-lg);
  transition: transform var(--pk-duration-slower) var(--pk-ease-out);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

/// Each layer travels a different distance, which is what creates the depth.
.pk-hero__layer--1 {
  z-index: 3;
  width: 62%;
  aspect-ratio: 1;
  inset-block-start: 16%;
  inset-inline-start: 19%;
  transform:
    translate3d(calc(var(--pk-px, 0) * 16px), calc(var(--pk-py, 0) * 16px), 0)
    rotate(-3deg);

  @include motion-safe {
    animation: pk-blob-morph 14s var(--pk-ease-in-out) infinite;
  }
}

.pk-hero__layer--2 {
  z-index: 2;
  width: 40%;
  aspect-ratio: 1;
  inset-block-start: 2%;
  inset-inline-end: 0;
  transform: translate3d(calc(var(--pk-px, 0) * 30px), calc(var(--pk-py, 0) * 26px), 0);

  @include motion-safe {
    animation: pk-blob-morph 11s var(--pk-ease-in-out) infinite reverse;
  }
}

.pk-hero__layer--3 {
  z-index: 1;
  width: 36%;
  aspect-ratio: 1;
  inset-block-end: 2%;
  inset-inline-start: 0;
  transform: translate3d(calc(var(--pk-px, 0) * -26px), calc(var(--pk-py, 0) * -20px), 0);

  @include motion-safe {
    animation: pk-blob-morph 17s var(--pk-ease-in-out) infinite;
  }
}

.pk-hero__scroll {
  position: relative;
  z-index: 2;
  display: none;
  align-items: center;
  justify-content: center;
  color: var(--pk-text-subtle);
  font-size: rem(12px);
  font-weight: 700;
  gap: 0.5em;
  letter-spacing: var(--pk-tracking-wide);
  margin-block-start: fluid(24px, 48px);
  text-transform: uppercase;

  @include up('md') {
    display: flex;
  }

  @include motion-safe {
    > svg {
      animation: pk-float 2.4s var(--pk-ease-in-out) infinite;
    }
  }
}
</style>
