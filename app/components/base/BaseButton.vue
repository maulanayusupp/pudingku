<script setup lang="ts">
/**
 * The one button in the system.
 *
 * Renders `<button>`, `<NuxtLink>` or `<a>` depending on the props, so callers
 * never have to restyle a link to look like a button. Variants map to the
 * brand's three levels of emphasis plus a quiet "ghost" for toolbars.
 */

interface Props {
  variant?: 'primary' | 'accent' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  /** Internal route — passed through `localePath()` by the caller. */
  to?: string
  /** External URL; opens in a new tab with the right rel attributes. */
  href?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  /** Stretch to the width of the parent. */
  block?: boolean
  /** Iconify name rendered before the label. */
  icon?: string
  /** Iconify name rendered after the label. */
  iconTrailing?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
})

const isInert = computed(() => props.disabled || props.loading)

/**
 * A disabled link is a trap: it still navigates on click and on Enter. So when
 * `disabled` is set we render a real `<button disabled>` instead, whatever the
 * `to`/`href` props say.
 */
const component = computed(() => {
  if (isInert.value) return 'button'
  if (props.href) return 'a'
  if (props.to) return resolveComponent('NuxtLink')
  return 'button'
})

const bindings = computed(() => {
  if (isInert.value) {
    return { type: props.type, disabled: true }
  }
  if (props.href) {
    return { href: props.href, target: '_blank', rel: 'noopener noreferrer' }
  }
  if (props.to) {
    return { to: props.to }
  }
  return { type: props.type, disabled: false }
})
</script>

<template>
  <component
    :is="component"
    class="pk-button"
    :class="[
      `pk-button--${variant}`,
      `pk-button--${size}`,
      { 'is-block': block, 'is-loading': loading, 'is-disabled': disabled },
    ]"
    :aria-busy="loading ? 'true' : undefined"
    v-bind="bindings"
  >
    <span class="pk-button__glow" aria-hidden="true" />

    <Icon v-if="loading" name="ph:spinner-gap-bold" class="pk-button__spinner" aria-hidden="true" />
    <Icon v-else-if="icon" :name="icon" class="pk-button__icon" aria-hidden="true" />

    <span class="pk-button__label"><slot /></span>

    <Icon v-if="iconTrailing && !loading" :name="iconTrailing" class="pk-button__icon" aria-hidden="true" />
  </component>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-button {
  position: relative;
  display: inline-flex;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
  border-radius: var(--pk-radius-pill);
  font-family: var(--pk-font-body);
  font-weight: 700;
  line-height: 1;
  gap: var(--pk-space-2);
  text-align: center;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition:
    background-color var(--pk-duration-base) var(--pk-ease-out),
    color var(--pk-duration-base) var(--pk-ease-out),
    border-color var(--pk-duration-base) var(--pk-ease-out),
    box-shadow var(--pk-duration-base) var(--pk-ease-out),
    transform var(--pk-duration-base) var(--pk-ease-jelly);

  @include focus-ring(3px);

  @include hover-capable {
    &:hover:not(.is-disabled, .is-loading) {
      transform: translateY(-2px) scale(1.02);
    }
  }

  &:active:not(.is-disabled, .is-loading) {
    transform: translateY(0) scale(0.97);
  }

  @include reduced-motion {
    &:hover,
    &:active {
      transform: none;
    }
  }
}

// ── Sizes ────────────────────────────────────────────────────────────────────
.pk-button--sm {
  padding: 0.55rem 1rem;
  font-size: rem(13px);
}

.pk-button--md {
  padding: 0.82rem 1.5rem;
  font-size: rem(15px);
}

.pk-button--lg {
  padding: 1.05rem 2rem;
  font-size: rem(16px);
}

// ── Variants ─────────────────────────────────────────────────────────────────
.pk-button--primary {
  background: var(--pk-plum-600);
  color: var(--pk-cream-100);
  box-shadow: var(--pk-shadow-md);

  @include hover-capable {
    &:hover:not(.is-disabled, .is-loading) {
      background: var(--pk-plum-700);
    }
  }
}

.pk-button--accent {
  background: linear-gradient(120deg, var(--pk-caramel-500), var(--pk-caramel-600));
  color: var(--pk-plum-900);
  box-shadow: var(--pk-shadow-glow);

  @include hover-capable {
    &:hover:not(.is-disabled, .is-loading) {
      background: linear-gradient(120deg, var(--pk-caramel-400), var(--pk-caramel-500));
    }
  }
}

.pk-button--outline {
  border-color: var(--pk-border-strong);
  background: transparent;
  color: var(--pk-plum-700);

  @include hover-capable {
    &:hover:not(.is-disabled, .is-loading) {
      border-color: var(--pk-plum-600);
      background: var(--pk-cream-200);
    }
  }
}

.pk-button--ghost {
  background: transparent;
  color: var(--pk-text);

  @include hover-capable {
    &:hover:not(.is-disabled, .is-loading) {
      background: var(--pk-cream-200);
    }
  }
}

// ── States ───────────────────────────────────────────────────────────────────
.is-block {
  display: flex;
  width: 100%;
}

.is-disabled,
.is-loading {
  opacity: 0.55;
  cursor: not-allowed;
  pointer-events: none;
}

// ── Details ──────────────────────────────────────────────────────────────────
.pk-button__label {
  position: relative;
  z-index: 1;
}

.pk-button__icon,
.pk-button__spinner {
  position: relative;
  z-index: 1;
  flex-shrink: 0;
  font-size: 1.15em;
}

.pk-button__spinner {
  animation: pk-spin-slow 900ms linear infinite;
}

/// A caramel sheen that sweeps across on hover. Purely decorative.
.pk-button__glow {
  position: absolute;
  z-index: 0;
  background: linear-gradient(115deg, transparent 20%, rgb(255 255 255 / 34%) 50%, transparent 78%);
  opacity: 0;
  inset: 0;
  transform: translateX(-70%);
  transition:
    opacity var(--pk-duration-fast) var(--pk-ease-out),
    transform var(--pk-duration-slow) var(--pk-ease-out);
}

@include hover-capable {
  .pk-button:hover:not(.is-disabled, .is-loading) .pk-button__glow {
    opacity: 1;
    transform: translateX(70%);
  }
}

@include reduced-motion {
  .pk-button__glow {
    display: none;
  }
}
</style>
