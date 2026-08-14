<script setup lang="ts">
/**
 * The Pudingku mark: a set pudding dome with a caramel drip running over it,
 * sitting in a plum roundel.
 *
 * No logo file was supplied, so the mark is drawn here as inline SVG. Keeping
 * it as a component (rather than an <img>) means it inherits `currentColor`,
 * stays crisp at any size, and costs no extra request. The same geometry is
 * reproduced by `scripts/generate-favicons.mjs` for the favicon set.
 */

interface Props {
  /** `full` shows mark + wordmark, `mark` is the roundel alone. */
  variant?: 'full' | 'mark'
  size?: 'sm' | 'md' | 'lg'
}

withDefaults(defineProps<Props>(), { variant: 'full', size: 'md' })
</script>

<template>
  <span class="pk-brand" :class="[`pk-brand--${size}`, `pk-brand--${variant}`]">
    <svg
      class="pk-brand__mark"
      viewBox="0 0 64 64"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="pk-brand-dome" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f0c990" />
          <stop offset="58%" stop-color="#d89a52" />
          <stop offset="100%" stop-color="#a56a26" />
        </linearGradient>
        <linearGradient id="pk-brand-drip" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#fae6cd" />
          <stop offset="100%" stop-color="#e6b477" />
        </linearGradient>
      </defs>

      <circle cx="32" cy="32" r="32" fill="currentColor" />

      <!-- Pudding dome: flat base, softly domed top -->
      <path
        d="M14 45c0-11.6 8-22 18-22s18 10.4 18 22z"
        fill="url(#pk-brand-dome)"
      />
      <ellipse cx="32" cy="45" rx="18" ry="4.4" fill="#a56a26" />

      <!-- Caramel running over the dome -->
      <path
        d="M18.6 34.5c2.6-4.8 7.6-8.6 13.4-8.6s10.8 3.8 13.4 8.6c-1.6 1.5-3.1.3-4.3 1.9-1.2 1.6-2.5 3.3-4.2 2.1-1.7-1.2-2-3.2-3.6-3.2s-2.3 2.4-4 3.4c-1.7 1-3-.9-4.2-2.3-1.2-1.4-2.9-.4-4.5-1.9z"
        fill="url(#pk-brand-drip)"
      />

      <!-- Highlight -->
      <ellipse cx="26" cy="31" rx="4.2" ry="2.6" fill="#fff" opacity="0.5" transform="rotate(-24 26 31)" />
    </svg>

    <span v-if="variant === 'full'" class="pk-brand__word">Pudingku</span>
  </span>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-brand {
  display: inline-flex;
  align-items: center;
  color: var(--pk-plum-700);
  gap: 0.55em;
}

.pk-brand__mark {
  display: block;
  flex-shrink: 0;
  width: 1em;
  height: 1em;
  filter: drop-shadow(0 4px 10px rgb(75 27 57 / 22%));
}

.pk-brand__word {
  font-family: var(--pk-font-display);
  font-variation-settings: 'SOFT' 60, 'WONK' 1;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1;
  color: var(--pk-plum-800);
}

.pk-brand--sm {
  font-size: rem(28px);

  .pk-brand__word {
    font-size: rem(19px);
  }
}

.pk-brand--md {
  font-size: rem(38px);

  .pk-brand__word {
    font-size: rem(24px);
  }
}

.pk-brand--lg {
  font-size: rem(56px);

  .pk-brand__word {
    font-size: rem(34px);
  }
}
</style>
