<script setup lang="ts">
/** Shared "nothing here" panel for an empty cart, empty search, or a 404 body. */

interface Props {
  title: string
  body?: string
  icon?: string
}

withDefaults(defineProps<Props>(), { icon: 'ph:bowl-food-duotone' })
</script>

<template>
  <div class="pk-empty">
    <span class="pk-empty__art" aria-hidden="true">
      <Icon :name="icon" />
    </span>

    <h3 class="pk-empty__title">
      {{ title }}
    </h3>

    <p v-if="body" class="pk-empty__body">
      {{ body }}
    </p>

    <div v-if="$slots.default" class="pk-empty__actions">
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: fluid(40px, 72px) var(--pk-space-5);
  border: 1px dashed var(--pk-border-strong);
  background: var(--pk-cream-50);
  border-radius: var(--pk-radius-xl);
  gap: var(--pk-space-3);
  text-align: center;
}

.pk-empty__art {
  display: grid;
  width: 5rem;
  height: 5rem;
  background: linear-gradient(140deg, var(--pk-caramel-100), var(--pk-cream-200));
  border-radius: var(--pk-radius-blob);
  color: var(--pk-caramel-700);
  font-size: rem(34px);
  place-items: center;

  @include motion-safe {
    animation: pk-blob-morph 9s var(--pk-ease-in-out) infinite;
  }
}

.pk-empty__title {
  font-family: var(--pk-font-display);
  font-size: fluid(20px, 26px);
  color: var(--pk-plum-800);
}

.pk-empty__body {
  max-width: 44ch;
  color: var(--pk-text-muted);
  font-size: rem(15px);
}

.pk-empty__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  margin-block-start: var(--pk-space-2);
  gap: var(--pk-space-3);
}
</style>
