<script setup lang="ts">
/**
 * Text-like input. Pairs with `<BaseField>`, which supplies the id and the
 * `aria-describedby` string through its default slot.
 */

interface Props {
  id?: string
  type?: 'text' | 'email' | 'tel' | 'date' | 'number' | 'search'
  placeholder?: string
  describedBy?: string
  invalid?: boolean
  autocomplete?: string
  inputmode?: 'text' | 'email' | 'tel' | 'numeric' | 'search'
  min?: string
  max?: string
  disabled?: boolean
  icon?: string
}

withDefaults(defineProps<Props>(), { type: 'text' })

const model = defineModel<string>({ default: '' })
</script>

<template>
  <div class="pk-input" :class="{ 'has-icon': Boolean(icon), 'is-invalid': invalid }">
    <Icon v-if="icon" :name="icon" class="pk-input__icon" aria-hidden="true" />
    <input
      :id="id"
      v-model="model"
      class="pk-input__control"
      :type="type"
      :placeholder="placeholder"
      :aria-describedby="describedBy"
      :aria-invalid="invalid ? 'true' : undefined"
      :autocomplete="autocomplete"
      :inputmode="inputmode"
      :min="min"
      :max="max"
      :disabled="disabled"
      v-bind="$attrs"
    >
  </div>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-input {
  position: relative;
  display: flex;
  align-items: center;
}

.pk-input__icon {
  position: absolute;
  color: var(--pk-text-subtle);
  font-size: rem(18px);
  inset-inline-start: var(--pk-space-4);
  pointer-events: none;
}

.pk-input__control {
  width: 100%;
  padding: 0.86rem var(--pk-space-4);
  border: 1px solid var(--pk-border);
  background: var(--pk-bg-raised);
  border-radius: var(--pk-radius-md);
  color: var(--pk-text);
  font-size: rem(15px);
  transition:
    border-color var(--pk-duration-fast) var(--pk-ease-out),
    box-shadow var(--pk-duration-fast) var(--pk-ease-out);

  &::placeholder {
    color: var(--pk-text-subtle);
  }

  &:hover:not(:disabled) {
    border-color: var(--pk-border-strong);
  }

  &:focus {
    border-color: var(--pk-caramel-500);
    box-shadow: 0 0 0 4px rgb(216 154 82 / 22%);
    outline: none;
  }

  &:disabled {
    background: var(--pk-cream-200);
    color: var(--pk-text-subtle);
    cursor: not-allowed;
  }
}

.has-icon .pk-input__control {
  padding-inline-start: calc(var(--pk-space-4) * 2 + 1rem);
}

.is-invalid .pk-input__control {
  border-color: var(--pk-danger);

  &:focus {
    box-shadow: 0 0 0 4px rgb(179 50 63 / 18%);
  }
}
</style>
