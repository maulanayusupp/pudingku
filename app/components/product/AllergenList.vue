<script setup lang="ts">
import type { AllergenCode } from '#shared/types/catalog'

/**
 * Allergen chips plus the standing cross-contact disclosure.
 *
 * The disclosure is rendered unconditionally — including for products with an
 * empty allergen list — because "no listed allergens" is not the same as "safe
 * for an allergic customer", and the compliance pages commit us to saying so.
 */

defineProps<{ allergens: AllergenCode[] }>()

const { t } = useI18n()
const { allergenIcon, allergenLabel } = useAllergens()
</script>

<template>
  <div class="pk-allergens">
    <p class="pk-allergens__label">
      {{ allergens.length ? t('allergens.contains') : t('allergens.none') }}
    </p>

    <ul v-if="allergens.length" class="pk-allergens__list">
      <li v-for="code in allergens" :key="code">
        <BaseBadge tone="warning" size="xs" :icon="allergenIcon(code)">
          {{ allergenLabel(code) }}
        </BaseBadge>
      </li>
    </ul>

    <p class="pk-allergens__notice">
      <Icon name="ph:info-fill" aria-hidden="true" />
      {{ t('allergens.crossContactNotice') }}
    </p>
  </div>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-allergens {
  display: flex;
  flex-direction: column;
  gap: var(--pk-space-3);
}

.pk-allergens__label {
  @include eyebrow;

  color: var(--pk-warning);
}

.pk-allergens__list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--pk-space-2);
}

.pk-allergens__notice {
  display: flex;
  padding: var(--pk-space-3);
  border: 1px solid var(--pk-border);
  background: var(--pk-cream-200);
  border-radius: var(--pk-radius-md);
  color: var(--pk-text-muted);
  font-size: rem(12.5px);
  gap: var(--pk-space-2);
  line-height: var(--pk-leading-normal);

  > svg {
    flex-shrink: 0;
    margin-block-start: 0.15em;
    color: var(--pk-warning);
  }
}
</style>
