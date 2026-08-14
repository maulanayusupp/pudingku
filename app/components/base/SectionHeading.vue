<script setup lang="ts">
/**
 * Eyebrow + title + description block that opens most sections.
 * Keeping it in one component is what makes the vertical rhythm identical on
 * every page without repeating three elements and their spacing each time.
 */

interface Props {
  eyebrow?: string
  title: string
  description?: string
  align?: 'start' | 'center'
  /** Heading level — sections nested inside an article need `h3`. */
  level?: 2 | 3
  /** Narrower measure for centred intros. */
  narrow?: boolean
}

withDefaults(defineProps<Props>(), {
  align: 'start',
  level: 2,
})
</script>

<template>
  <header
    class="pk-heading"
    :class="[`pk-heading--${align}`, { 'is-narrow': narrow }]"
  >
    <p v-if="eyebrow" class="pk-heading__eyebrow">
      <span class="pk-heading__spark" aria-hidden="true" />
      {{ eyebrow }}
    </p>

    <component :is="`h${level}`" class="pk-heading__title">
      {{ title }}
    </component>

    <p v-if="description" class="pk-heading__description">
      {{ description }}
    </p>

    <div v-if="$slots.default" class="pk-heading__actions">
      <slot />
    </div>
  </header>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-heading {
  display: flex;
  flex-direction: column;
  gap: var(--pk-space-3);
}

.pk-heading--center {
  align-items: center;
  text-align: center;
}

.is-narrow {
  max-width: 62ch;
  margin-inline: auto;
}

.pk-heading__eyebrow {
  @include eyebrow;

  display: flex;
  align-items: center;
  color: var(--pk-caramel-700);
  gap: 0.6em;
}

/// A small caramel lozenge that reads as a drop of syrup next to the eyebrow.
.pk-heading__spark {
  width: 22px;
  height: 8px;
  background: linear-gradient(90deg, var(--pk-caramel-500), var(--pk-berry));
  border-radius: var(--pk-radius-pill);
}

.pk-heading__title {
  @include display(28px, 50px);

  color: var(--pk-plum-800);
}

.pk-heading__description {
  max-width: 58ch;
  color: var(--pk-text-muted);
  font-size: fluid(15px, 18px);
  line-height: var(--pk-leading-relaxed);
}

.pk-heading--center .pk-heading__description {
  margin-inline: auto;
}

.pk-heading__actions {
  margin-block-start: var(--pk-space-2);
}
</style>
