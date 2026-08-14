<script setup lang="ts">
/** Multi-line input. Same contract as `<BaseInput>`. */

interface Props {
  id?: string
  placeholder?: string
  describedBy?: string
  invalid?: boolean
  rows?: number
  maxlength?: number
  disabled?: boolean
}

withDefaults(defineProps<Props>(), { rows: 5 })

const model = defineModel<string>({ default: '' })
</script>

<template>
  <textarea
    :id="id"
    v-model="model"
    class="pk-textarea"
    :class="{ 'is-invalid': invalid }"
    :rows="rows"
    :placeholder="placeholder"
    :aria-describedby="describedBy"
    :aria-invalid="invalid ? 'true' : undefined"
    :maxlength="maxlength"
    :disabled="disabled"
  />
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-textarea {
  width: 100%;
  padding: 0.86rem var(--pk-space-4);
  border: 1px solid var(--pk-border);
  background: var(--pk-bg-raised);
  border-radius: var(--pk-radius-md);
  color: var(--pk-text);
  font-family: inherit;
  font-size: rem(15px);
  line-height: var(--pk-leading-normal);
  resize: vertical;
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

  &.is-invalid {
    border-color: var(--pk-danger);
  }
}
</style>
