<script setup lang="ts">
/**
 * Label + hint + error wrapper shared by every form control.
 *
 * It owns the `id` wiring so a control never has to invent one, and it links
 * the hint and error text with `aria-describedby` / `aria-errormessage` so the
 * message is announced rather than only seen.
 */

interface Props {
  label: string
  /** Rendered translation of the current error, or null. */
  error?: string | null
  hint?: string
  required?: boolean
  /** Shown next to the label when the field is genuinely optional. */
  optionalLabel?: string
}

const props = defineProps<Props>()

const id = useId()
const hintId = computed(() => (props.hint ? `${id}-hint` : undefined))
const errorId = computed(() => (props.error ? `${id}-error` : undefined))

const describedBy = computed(() =>
  [hintId.value, errorId.value].filter(Boolean).join(' ') || undefined,
)

defineExpose({ id })
</script>

<template>
  <div class="pk-field" :class="{ 'has-error': Boolean(error) }">
    <label class="pk-field__label" :for="id">
      {{ label }}
      <span v-if="!required && optionalLabel" class="pk-field__optional">({{ optionalLabel }})</span>
      <span v-if="required" class="pk-field__required" aria-hidden="true">*</span>
    </label>

    <slot
      :id="id"
      :described-by="describedBy"
      :invalid="Boolean(error)"
    />

    <p v-if="hint && !error" :id="hintId" class="pk-field__hint">
      {{ hint }}
    </p>

    <p v-if="error" :id="errorId" class="pk-field__error" role="alert">
      <Icon name="ph:warning-circle-fill" aria-hidden="true" />
      {{ error }}
    </p>
  </div>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-field {
  display: flex;
  flex-direction: column;
  gap: var(--pk-space-2);
}

.pk-field__label {
  display: flex;
  align-items: baseline;
  font-size: rem(14px);
  font-weight: 700;
  gap: 0.35em;
  color: var(--pk-ink-700);
}

.pk-field__optional {
  color: var(--pk-text-subtle);
  font-weight: 500;
  font-size: rem(12px);
}

.pk-field__required {
  color: var(--pk-danger);
}

.pk-field__hint {
  color: var(--pk-text-muted);
  font-size: rem(13px);
  line-height: var(--pk-leading-snug);
}

.pk-field__error {
  display: flex;
  align-items: center;
  color: var(--pk-danger);
  font-size: rem(13px);
  font-weight: 600;
  gap: 0.35em;
  line-height: var(--pk-leading-snug);
}
</style>
