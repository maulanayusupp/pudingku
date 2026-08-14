<script setup lang="ts">
import type { NuxtError } from '#app'

/**
 * Error page for 404 and 5xx.
 *
 * Rendered outside the layout by Nuxt, so it brings its own minimal chrome.
 * Copy is localized; the raw error message is never shown to a visitor.
 */

const props = defineProps<{ error: NuxtError }>()

const { t } = useI18n()
const localePath = useLocalePath()

const isNotFound = computed(() => props.error?.statusCode === 404)

const title = computed(() => (isNotFound.value ? t('errors.page404Title') : t('errors.page500Title')))
const body = computed(() => (isNotFound.value ? t('errors.page404Body') : t('errors.page500Body')))

useHead({
  title: () => title.value,
  meta: [{ name: 'robots', content: 'noindex, nofollow' }],
})

const goHome = () => clearError({ redirect: localePath('/') })
</script>

<template>
  <div class="pk-error">
    <div class="pk-error__inner pk-container--narrow">
      <BrandMark size="md" class="pk-error__brand" />

      <p class="pk-error__code">
        {{ error?.statusCode ?? 500 }}
      </p>

      <h1 class="pk-error__title">
        {{ title }}
      </h1>

      <p class="pk-error__body">
        {{ body }}
      </p>

      <div class="pk-error__actions">
        <BaseButton variant="accent" size="lg" @click="goHome">
          {{ t('errors.backHome') }}
        </BaseButton>
        <BaseButton :to="localePath('/produk')" variant="outline" size="lg">
          {{ t('common.backToShop') }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-error {
  display: grid;
  min-height: 100svh;
  background:
    radial-gradient(58% 48% at 76% 18%, rgb(240 201 144 / 52%) 0%, transparent 64%),
    radial-gradient(52% 44% at 14% 82%, rgb(194 74 99 / 20%) 0%, transparent 66%),
    var(--pk-bg);
  place-items: center;
  padding: var(--pk-space-6) 0;
}

.pk-error__inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--pk-space-4);
  text-align: center;
}

.pk-error__brand {
  margin-block-end: var(--pk-space-4);
}

.pk-error__code {
  font-family: var(--pk-font-display);
  font-size: fluid(64px, 128px);
  font-weight: 700;
  color: var(--pk-caramel-500);
  line-height: 1;
  letter-spacing: var(--pk-tracking-tight);

  @include motion-safe {
    animation: pk-wobble 1.4s var(--pk-ease-jelly);
  }
}

.pk-error__title {
  @include display(26px, 44px);

  color: var(--pk-plum-800);
}

.pk-error__body {
  max-width: 44ch;
  color: var(--pk-text-muted);
  font-size: rem(16px);
  line-height: var(--pk-leading-relaxed);
}

.pk-error__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: var(--pk-space-3);
  margin-block-start: var(--pk-space-3);
}
</style>
