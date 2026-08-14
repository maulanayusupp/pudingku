<script setup lang="ts">
/**
 * −/+ stepper with a readable live value.
 *
 * The number is a `<output>` with `aria-live="polite"` so a screen reader
 * announces the new quantity after a press, rather than staying silent while
 * the visible number changes.
 */

interface Props {
  min?: number
  max?: number
  /** Accessible name, e.g. "Quantity of Belgian Chocolate Lava". */
  label: string
  size?: 'sm' | 'md'
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  min: 1,
  max: 20,
  size: 'md',
})

const model = defineModel<number>({ required: true })

const { t } = useI18n()

const canDecrease = computed(() => model.value > props.min && !props.disabled)
const canIncrease = computed(() => model.value < props.max && !props.disabled)

const decrease = () => {
  if (canDecrease.value) model.value -= 1
}

const increase = () => {
  if (canIncrease.value) model.value += 1
}
</script>

<template>
  <div class="pk-stepper" :class="`pk-stepper--${size}`" role="group" :aria-label="label">
    <button
      type="button"
      class="pk-stepper__button"
      :disabled="!canDecrease"
      :aria-label="t('common.decrease')"
      @click="decrease"
    >
      <Icon name="ph:minus-bold" aria-hidden="true" />
    </button>

    <output class="pk-stepper__value" aria-live="polite">{{ model }}</output>

    <button
      type="button"
      class="pk-stepper__button"
      :disabled="!canIncrease"
      :aria-label="t('common.increase')"
      @click="increase"
    >
      <Icon name="ph:plus-bold" aria-hidden="true" />
    </button>
  </div>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-stepper {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--pk-border);
  background: var(--pk-bg-raised);
  border-radius: var(--pk-radius-pill);
  overflow: hidden;
}

.pk-stepper__button {
  display: grid;
  place-items: center;
  color: var(--pk-plum-700);
  transition:
    background-color var(--pk-duration-fast) var(--pk-ease-out),
    color var(--pk-duration-fast) var(--pk-ease-out);

  @include focus-ring(-2px);

  @include hover-capable {
    &:hover:not(:disabled) {
      background: var(--pk-cream-200);
    }
  }

  &:disabled {
    color: var(--pk-text-subtle);
    cursor: not-allowed;
  }
}

.pk-stepper__value {
  min-width: 2.4ch;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  text-align: center;
}

.pk-stepper--sm {
  .pk-stepper__button {
    width: 2rem;
    height: 2rem;
    font-size: rem(12px);
  }

  .pk-stepper__value {
    font-size: rem(14px);
  }
}

.pk-stepper--md {
  .pk-stepper__button {
    width: 2.75rem;
    height: 2.75rem;
    font-size: rem(14px);
  }

  .pk-stepper__value {
    font-size: rem(16px);
  }
}
</style>
