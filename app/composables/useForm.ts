import { HttpError } from '~/services/http'
import { hasErrors, validate } from '~/utils/validation'
import type { Errors, Schema } from '~/utils/validation'

/**
 * Form state machine shared by the contact and checkout forms.
 *
 * Responsibilities:
 *  - run the local schema before touching the network
 *  - merge server-side field errors (422) back onto the same fields
 *  - expose `status` so the submit button can show one clear state
 *
 * Error values are translation KEYS; the template renders them with `t()`.
 */

export type FormStatus = 'idle' | 'submitting' | 'success' | 'error'

export interface UseFormOptions<TValues extends Record<string, string>, TResult> {
  initial: TValues
  /**
   * Validation rules. Accepts a getter or a ref so a form can add or drop rules
   * as the user changes something — the checkout only validates the address
   * fields once "deliver to me" is selected.
   */
  schema: MaybeRefOrGetter<Schema<TValues>>
  submit: (values: TValues) => Promise<TResult>
  onSuccess?: (result: TResult) => void | Promise<void>
}

export function useForm<TValues extends Record<string, string>, TResult>(
  options: UseFormOptions<TValues, TResult>,
) {
  const values = reactive({ ...options.initial }) as TValues
  const errors = ref<Errors<TValues>>({})
  const status = ref<FormStatus>('idle')
  /** Non-field error, e.g. a 500 — rendered above the submit button. */
  const formError = ref<string | null>(null)
  const result = ref<TResult | null>(null)
  /**
   * Fields the user has left, so errors do not appear while typing.
   * `shallowRef` keeps the `Set<keyof TValues>` generic intact — `ref()` would
   * unwrap it to `Set<string | number | symbol>`.
   */
  const touched = shallowRef(new Set<keyof TValues>())

  const isSubmitting = computed(() => status.value === 'submitting')

  /** Always read through this so conditional rules are picked up. */
  const currentSchema = (): Schema<TValues> => toValue(options.schema)

  function validateField(field: keyof TValues): void {
    touched.value.add(field)
    const rules = currentSchema()[field]
    if (!rules) {
      const { [field]: _skipped, ...rest } = errors.value
      errors.value = rest as Errors<TValues>
      return
    }

    const scoped = validate(values, { [field]: rules } as unknown as Schema<TValues>)
    if (scoped[field]) {
      errors.value = { ...errors.value, [field]: scoped[field] }
    } else {
      const { [field]: _removed, ...rest } = errors.value
      errors.value = rest as Errors<TValues>
    }
  }

  function errorFor(field: keyof TValues): string | null {
    return touched.value.has(field) ? (errors.value[field] ?? null) : null
  }

  function reset(): void {
    Object.assign(values, options.initial)
    errors.value = {}
    touched.value = new Set<keyof TValues>()
    formError.value = null
    status.value = 'idle'
  }

  async function handleSubmit(): Promise<void> {
    formError.value = null
    const schema = currentSchema()
    errors.value = validate(values, schema)
    touched.value = new Set(Object.keys(schema) as (keyof TValues)[])

    if (hasErrors(errors.value)) {
      status.value = 'error'
      formError.value = 'validation.formHasErrors'
      return
    }

    status.value = 'submitting'

    try {
      const response = await options.submit(values)
      result.value = response as TResult
      status.value = 'success'
      await options.onSuccess?.(response)
    } catch (error) {
      status.value = 'error'

      if (error instanceof HttpError && error.fields) {
        errors.value = { ...errors.value, ...(error.fields as Errors<TValues>) }
        formError.value = error.message
      } else {
        formError.value = error instanceof HttpError ? error.message : 'errors.unknown'
      }
    }
  }

  return {
    values,
    errors,
    status,
    formError,
    result,
    isSubmitting,
    errorFor,
    validateField,
    handleSubmit,
    reset,
  }
}
