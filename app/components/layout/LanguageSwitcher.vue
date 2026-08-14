<script setup lang="ts">
/**
 * ID / EN toggle.
 *
 * Uses `switchLocalePath()` so each option links to the *equivalent* URL in the
 * other language (`/produk/mangga` ↔ `/en/products/mangga`) instead of dropping
 * the visitor on the home page. Rendering real `<a>` elements also means the
 * alternate URLs are crawlable.
 */

const { locale, locales, t } = useI18n()
const switchLocalePath = useSwitchLocalePath()

interface LocaleOption {
  code: string
  name: string
}

const options = computed<LocaleOption[]>(() =>
  (locales.value as LocaleOption[]).map(item => ({
    code: item.code,
    name: item.name,
  })),
)

const shortLabel = (code: string) => t(`language.${code}Short`)
</script>

<template>
  <div class="pk-lang" role="group" :aria-label="t('common.changeLanguage')">
    <NuxtLink
      v-for="option in options"
      :key="option.code"
      class="pk-lang__option"
      :class="{ 'is-active': option.code === locale }"
      :to="switchLocalePath(option.code as never)"
      :aria-current="option.code === locale ? 'true' : undefined"
      :title="t('language.switchTo', { language: option.name })"
      :hreflang="option.code"
    >
      <span aria-hidden="true">{{ shortLabel(option.code) }}</span>
      <span class="pk-sr-only">{{ t('language.switchTo', { language: option.name }) }}</span>
    </NuxtLink>
  </div>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-lang {
  display: inline-flex;
  padding: 3px;
  border: 1px solid var(--pk-border);
  background: var(--pk-cream-200);
  border-radius: var(--pk-radius-pill);
  gap: 2px;
}

.pk-lang__option {
  padding: 0.34rem 0.7rem;
  border-radius: var(--pk-radius-pill);
  color: var(--pk-text-muted);
  font-size: rem(12px);
  font-weight: 800;
  letter-spacing: 0.06em;
  line-height: 1;
  transition:
    background-color var(--pk-duration-fast) var(--pk-ease-out),
    color var(--pk-duration-fast) var(--pk-ease-out);

  @include focus-ring(2px);

  @include hover-capable {
    &:hover {
      color: var(--pk-plum-700);
    }
  }

  &.is-active {
    background: var(--pk-plum-600);
    color: var(--pk-cream-100);
    box-shadow: var(--pk-shadow-xs);
  }
}
</style>
