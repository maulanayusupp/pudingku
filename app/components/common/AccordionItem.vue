<script setup lang="ts">
/**
 * FAQ row built on native `<details>`.
 *
 * Native gives keyboard operation, the correct expanded/collapsed semantics and
 * — importantly for SEO — content that is present in the DOM even when closed,
 * so the answers are indexable.
 */

interface Props {
  question: string
  answer: string
  /** Open by default; used for the first item on the FAQ page. */
  open?: boolean
}

defineProps<Props>()
</script>

<template>
  <details class="pk-accordion" :open="open">
    <summary class="pk-accordion__summary">
      <span class="pk-accordion__question">{{ question }}</span>
      <span class="pk-accordion__marker" aria-hidden="true">
        <Icon name="ph:plus-bold" />
      </span>
    </summary>

    <div class="pk-accordion__panel">
      <p>{{ answer }}</p>
    </div>
  </details>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-accordion {
  border: 1px solid var(--pk-border);
  background: var(--pk-bg-raised);
  border-radius: var(--pk-radius-lg);
  overflow: hidden;
  transition: border-color var(--pk-duration-base) var(--pk-ease-out);

  &[open] {
    border-color: var(--pk-caramel-300);
    box-shadow: var(--pk-shadow-sm);
  }
}

.pk-accordion__summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--pk-space-4) var(--pk-space-5);
  gap: var(--pk-space-4);
  cursor: pointer;
  list-style: none;

  &::-webkit-details-marker {
    display: none;
  }

  @include focus-ring(-3px);

  @include hover-capable {
    &:hover {
      background: var(--pk-cream-50);
    }
  }
}

.pk-accordion__question {
  font-family: var(--pk-font-display);
  font-size: fluid(17px, 20px);
  font-weight: 600;
  color: var(--pk-plum-800);
  line-height: var(--pk-leading-snug);
}

.pk-accordion__marker {
  display: grid;
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  background: var(--pk-cream-200);
  border-radius: var(--pk-radius-pill);
  color: var(--pk-plum-700);
  font-size: rem(13px);
  place-items: center;
  transition: transform var(--pk-duration-base) var(--pk-ease-jelly);
}

.pk-accordion[open] .pk-accordion__marker {
  background: var(--pk-caramel-500);
  color: var(--pk-plum-900);
  transform: rotate(135deg);
}

.pk-accordion__panel {
  padding: 0 var(--pk-space-5) var(--pk-space-5);
  color: var(--pk-text-muted);
  font-size: rem(15px);
  line-height: var(--pk-leading-relaxed);

  @include motion-safe {
    animation: pk-fade-up var(--pk-duration-base) var(--pk-ease-out);
  }
}
</style>
