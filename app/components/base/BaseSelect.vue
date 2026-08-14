<script setup lang="ts">
/**
 * Native select with brand chrome. Native is deliberate: it gets the platform's
 * own picker on mobile, keyboard support and screen-reader semantics for free.
 */

export interface SelectOption {
  value: string
  label: string
}

interface Props {
  id?: string
  options: SelectOption[]
  describedBy?: string
  invalid?: boolean
  disabled?: boolean
  /** Visually hidden label when the select is used standalone (e.g. a toolbar). */
  ariaLabel?: string
}

defineProps<Props>()

const model = defineModel<string>({ required: true })
</script>

<template>
  <div class="pk-select" :class="{ 'is-invalid': invalid }">
    <select
      :id="id"
      v-model="model"
      class="pk-select__control"
      :aria-describedby="describedBy"
      :aria-invalid="invalid ? 'true' : undefined"
      :aria-label="ariaLabel"
      :disabled="disabled"
    >
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
    <Icon name="ph:caret-down-bold" class="pk-select__caret" aria-hidden="true" />
  </div>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-select {
  position: relative;
  display: flex;
  align-items: center;
}

.pk-select__control {
  width: 100%;
  padding: 0.8rem calc(var(--pk-space-6) + 0.5rem) 0.8rem var(--pk-space-4);
  border: 1px solid var(--pk-border);
  background: var(--pk-bg-raised);
  border-radius: var(--pk-radius-pill);
  color: var(--pk-text);
  font-size: rem(14px);
  font-weight: 600;
  appearance: none;
  cursor: pointer;
  transition:
    border-color var(--pk-duration-fast) var(--pk-ease-out),
    box-shadow var(--pk-duration-fast) var(--pk-ease-out);

  &:hover:not(:disabled) {
    border-color: var(--pk-border-strong);
  }

  &:focus-visible {
    border-color: var(--pk-caramel-500);
    box-shadow: 0 0 0 4px rgb(216 154 82 / 22%);
    outline: none;
  }
}

.pk-select__caret {
  position: absolute;
  color: var(--pk-plum-600);
  font-size: rem(14px);
  inset-inline-end: var(--pk-space-4);
  pointer-events: none;
}

.is-invalid .pk-select__control {
  border-color: var(--pk-danger);
}
</style>
