<script setup lang="ts">
/**
 * Inline callout used for the demo-checkout disclosure, allergen warnings and
 * form-level errors.
 *
 * These notices carry the honesty requirements of the project (what the site
 * cannot do yet), so they are a first-class component rather than ad-hoc markup
 * that could be dropped during a redesign.
 */

interface Props {
  tone?: 'info' | 'warning' | 'success' | 'danger'
  title?: string
  icon?: string
  /** Renders as `role="alert"` so screen readers announce it immediately. */
  assertive?: boolean
}

const props = withDefaults(defineProps<Props>(), { tone: 'info' })

const DEFAULT_ICONS: Record<NonNullable<Props['tone']>, string> = {
  info: 'ph:info-fill',
  warning: 'ph:warning-fill',
  success: 'ph:check-circle-fill',
  danger: 'ph:x-circle-fill',
}

const resolvedIcon = computed(() => props.icon ?? DEFAULT_ICONS[props.tone])
</script>

<template>
  <div
    class="pk-notice"
    :class="`pk-notice--${tone}`"
    :role="assertive ? 'alert' : 'note'"
  >
    <Icon :name="resolvedIcon" class="pk-notice__icon" aria-hidden="true" />

    <div class="pk-notice__body">
      <p v-if="title" class="pk-notice__title">
        {{ title }}
      </p>
      <div class="pk-notice__content">
        <slot />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-notice {
  display: flex;
  padding: var(--pk-space-4);
  border: 1px solid;
  border-radius: var(--pk-radius-md);
  font-size: rem(14px);
  gap: var(--pk-space-3);
  line-height: var(--pk-leading-normal);
}

.pk-notice__icon {
  flex-shrink: 0;
  margin-block-start: 0.1em;
  font-size: rem(20px);
}

.pk-notice__body {
  min-width: 0;
}

.pk-notice__title {
  margin-block-end: 0.25rem;
  font-weight: 700;
}

.pk-notice__content :deep(a) {
  color: inherit;
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 0.18em;
}

.pk-notice--info {
  border-color: #cdd9e6;
  background: #eef4fa;
  color: #2c4257;
}

.pk-notice--warning {
  border-color: #eed6a6;
  background: #fdf3e0;
  color: #74521a;
}

.pk-notice--success {
  border-color: #bcd8c4;
  background: #ecf4ee;
  color: #2c5238;
}

.pk-notice--danger {
  border-color: #edc2c6;
  background: #fbeced;
  color: #7d2731;
}
</style>
