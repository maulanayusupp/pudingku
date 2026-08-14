<script setup lang="ts">
/**
 * Small pill used for product badges, allergen chips and status labels.
 * `tone` maps to a semantic colour rather than a raw hex, so a palette change
 * never has to touch a component.
 */

interface Props {
  tone?: 'neutral' | 'accent' | 'plum' | 'success' | 'warning' | 'danger'
  size?: 'xs' | 'sm'
  icon?: string
}

withDefaults(defineProps<Props>(), {
  tone: 'neutral',
  size: 'sm',
})
</script>

<template>
  <span class="pk-badge" :class="[`pk-badge--${tone}`, `pk-badge--${size}`]">
    <Icon v-if="icon" :name="icon" class="pk-badge__icon" aria-hidden="true" />
    <slot />
  </span>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-badge {
  display: inline-flex;
  align-items: center;
  border: 1px solid transparent;
  border-radius: var(--pk-radius-pill);
  font-weight: 700;
  line-height: 1;
  gap: 0.34em;
  white-space: nowrap;
}

.pk-badge--xs {
  padding: 0.3rem 0.55rem;
  font-size: rem(11px);
  letter-spacing: 0.03em;
}

.pk-badge--sm {
  padding: 0.42rem 0.75rem;
  font-size: rem(12px);
  letter-spacing: 0.02em;
}

.pk-badge__icon {
  font-size: 1.15em;
}

.pk-badge--neutral {
  border-color: var(--pk-border);
  background: var(--pk-cream-200);
  color: var(--pk-ink-700);
}

.pk-badge--accent {
  background: var(--pk-caramel-100);
  border-color: var(--pk-caramel-300);
  color: var(--pk-caramel-700);
}

.pk-badge--plum {
  background: var(--pk-plum-600);
  color: var(--pk-cream-100);
}

.pk-badge--success {
  background: #e6f0e8;
  border-color: #bcd8c4;
  color: var(--pk-success);
}

.pk-badge--warning {
  background: #fbeed6;
  border-color: #eed6a6;
  color: var(--pk-warning);
}

.pk-badge--danger {
  background: #f8e3e5;
  border-color: #edc2c6;
  color: var(--pk-danger);
}
</style>
