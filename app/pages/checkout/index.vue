<script setup lang="ts">
import { orderService } from '~/services/order.service'
import { useCartStore } from '~/stores/cart'
import { useOrderStore } from '~/stores/order'
import { email as emailRule, isoDate, maxLength, minLength, phone as phoneRule, required } from '~/utils/validation'
import { SITE, confirmed } from '#shared/config/site'
import type { OrderInput } from '#shared/types/order'
import type { Schema } from '~/utils/validation'

/**
 * Checkout.
 *
 * DEMO FLOW — the notice at the top of the form says so, and it is not optional
 * chrome: there is no payment gateway and no order storage behind this. The
 * server validates the payload and returns an authoritative total; the visitor
 * then emails us the reference to actually place the order.
 *
 * The delivery-only fields are validated conditionally, which is why the schema
 * is a computed rather than a constant.
 */

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { money } = useMoney()
const cart = useCartStore()
const orders = useOrderStore()
const router = useRouter()

const contactEmail = confirmed(SITE.email) ?? ''

interface CheckoutValues extends Record<string, string> {
  name: string
  email: string
  phone: string
  method: string
  address: string
  city: string
  postalCode: string
  preferredDate: string
  note: string
}

const initial: CheckoutValues = {
  name: '',
  email: '',
  phone: '',
  method: 'pickup',
  address: '',
  city: '',
  postalCode: '',
  preferredDate: '',
  note: '',
}

/** Earliest date we could plausibly deliver: tomorrow. */
const minDate = computed(() => {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return date.toISOString().slice(0, 10)
})

const isDelivery = ref(false)

const schema = computed<Schema<CheckoutValues>>(() => ({
  name: [required(), minLength(2)],
  email: [required(), emailRule()],
  phone: [required(), phoneRule()],
  preferredDate: [isoDate()],
  note: [maxLength(500)],
  ...(isDelivery.value
    ? {
        address: [required(), minLength(8)],
        city: [required()],
      }
    : {}),
}))

const form = useForm<CheckoutValues, Awaited<ReturnType<typeof orderService.create>>>({
  initial,
  // Passed as a ref so the conditional delivery rules above stay live.
  schema,
  submit: values => orderService.create(
    {
      ...values,
      method: values.method as OrderInput['method'],
      items: cart.lines.map(line => ({ slug: line.slug, quantity: line.quantity })),
    } as OrderInput,
    locale.value,
  ),
  onSuccess: async (summary) => {
    orders.remember(summary)
    cart.clear()
    await router.push(localePath('/checkout/berhasil'))
  },
})

// Switching to pickup must also clear any address errors already on screen.
watch(() => form.values.method, (method) => {
  isDelivery.value = method === 'delivery'
  if (method === 'pickup') {
    const { address: _a, city: _c, postalCode: _p, ...rest } = form.errors.value
    form.errors.value = rest
  }
})

const total = computed(() => cart.subtotalIdr + (isDelivery.value ? cart.deliveryFeeIdr : 0))

const methodOptions = computed(() => [
  { value: 'pickup', label: t('checkout.fields.pickup'), hint: t('checkout.fields.pickupHint') },
  { value: 'delivery', label: t('checkout.fields.delivery'), hint: t('checkout.fields.deliveryHint') },
])

useSeoPage(() => ({
  title: t('checkout.meta.title'),
  description: t('checkout.meta.description'),
  noindex: true,
}))
</script>

<template>
  <div class="pk-checkout pk-section">
    <div class="pk-container--wide">
      <BreadcrumbTrail
        class="pk-checkout__crumbs"
        :items="[
          { label: t('nav.home'), to: localePath('/') },
          { label: t('cart.title'), to: localePath('/keranjang') },
          { label: t('nav.checkout') },
        ]"
      />

      <SectionHeading
        :eyebrow="t('checkout.eyebrow')"
        :title="t('checkout.title')"
        :description="t('checkout.description')"
        :level="1"
      />

      <ClientOnly>
        <EmptyState
          v-if="cart.isEmpty"
          class="pk-checkout__empty"
          :title="t('cart.empty')"
          :body="t('cart.emptyBody')"
          icon="ph:shopping-bag-open-duotone"
        >
          <BaseButton :to="localePath('/produk')" variant="accent">
            {{ t('cart.emptyCta') }}
          </BaseButton>
        </EmptyState>

        <div v-else class="pk-checkout__grid">
          <form class="pk-checkout__form" novalidate @submit.prevent="form.handleSubmit">
            <BaseNotice tone="warning" :title="t('checkout.demoNoticeTitle')">
              {{ t('checkout.demoNoticeBody', { email: contactEmail }) }}
            </BaseNotice>

            <fieldset class="pk-checkout__fieldset">
              <legend class="pk-checkout__legend">
                {{ t('checkout.sectionContact') }}
              </legend>

              <div class="pk-checkout__row">
                <BaseField
                  v-slot="{ id, describedBy, invalid }"
                  :label="t('checkout.fields.name')"
                  :error="form.errorFor('name') ? t(form.errorFor('name')!) : null"
                  required
                >
                  <BaseInput
                    :id="id"
                    v-model="form.values.name"
                    :placeholder="t('checkout.fields.namePlaceholder')"
                    :described-by="describedBy"
                    :invalid="invalid"
                    autocomplete="name"
                    @blur="form.validateField('name')"
                  />
                </BaseField>

                <BaseField
                  v-slot="{ id, describedBy, invalid }"
                  :label="t('checkout.fields.phone')"
                  :error="form.errorFor('phone') ? t(form.errorFor('phone')!) : null"
                  required
                >
                  <BaseInput
                    :id="id"
                    v-model="form.values.phone"
                    type="tel"
                    inputmode="tel"
                    :placeholder="t('checkout.fields.phonePlaceholder')"
                    :described-by="describedBy"
                    :invalid="invalid"
                    autocomplete="tel"
                    @blur="form.validateField('phone')"
                  />
                </BaseField>
              </div>

              <BaseField
                v-slot="{ id, describedBy, invalid }"
                :label="t('checkout.fields.email')"
                :error="form.errorFor('email') ? t(form.errorFor('email')!) : null"
                required
              >
                <BaseInput
                  :id="id"
                  v-model="form.values.email"
                  type="email"
                  inputmode="email"
                  :placeholder="t('checkout.fields.emailPlaceholder')"
                  :described-by="describedBy"
                  :invalid="invalid"
                  autocomplete="email"
                  @blur="form.validateField('email')"
                />
              </BaseField>
            </fieldset>

            <fieldset class="pk-checkout__fieldset">
              <legend class="pk-checkout__legend">
                {{ t('checkout.sectionFulfilment') }}
              </legend>

              <div class="pk-checkout__methods">
                <label
                  v-for="option in methodOptions"
                  :key="option.value"
                  class="pk-checkout__method"
                  :class="{ 'is-active': form.values.method === option.value }"
                >
                  <input
                    v-model="form.values.method"
                    class="pk-sr-only"
                    type="radio"
                    name="pk-method"
                    :value="option.value"
                  >
                  <span class="pk-checkout__methodLabel">{{ option.label }}</span>
                  <span class="pk-checkout__methodHint">{{ option.hint }}</span>
                </label>
              </div>

              <template v-if="isDelivery">
                <BaseField
                  v-slot="{ id, describedBy, invalid }"
                  :label="t('checkout.fields.address')"
                  :error="form.errorFor('address') ? t(form.errorFor('address')!) : null"
                  required
                >
                  <BaseTextarea
                    :id="id"
                    v-model="form.values.address"
                    :rows="3"
                    :placeholder="t('checkout.fields.addressPlaceholder')"
                    :described-by="describedBy"
                    :invalid="invalid"
                    @blur="form.validateField('address')"
                  />
                </BaseField>

                <div class="pk-checkout__row">
                  <BaseField
                    v-slot="{ id, describedBy, invalid }"
                    :label="t('checkout.fields.city')"
                    :error="form.errorFor('city') ? t(form.errorFor('city')!) : null"
                    required
                  >
                    <BaseInput
                      :id="id"
                      v-model="form.values.city"
                      :placeholder="t('checkout.fields.cityPlaceholder')"
                      :described-by="describedBy"
                      :invalid="invalid"
                      autocomplete="address-level2"
                      @blur="form.validateField('city')"
                    />
                  </BaseField>

                  <BaseField
                    v-slot="{ id, describedBy, invalid }"
                    :label="t('checkout.fields.postalCode')"
                    :optional-label="t('common.optional')"
                    :error="form.errorFor('postalCode') ? t(form.errorFor('postalCode')!) : null"
                  >
                    <BaseInput
                      :id="id"
                      v-model="form.values.postalCode"
                      inputmode="numeric"
                      :described-by="describedBy"
                      :invalid="invalid"
                      autocomplete="postal-code"
                    />
                  </BaseField>
                </div>
              </template>
            </fieldset>

            <fieldset class="pk-checkout__fieldset">
              <legend class="pk-checkout__legend">
                {{ t('checkout.sectionSchedule') }}
              </legend>

              <BaseField
                v-slot="{ id, describedBy, invalid }"
                :label="t('checkout.fields.preferredDate')"
                :optional-label="t('common.optional')"
                :hint="t('checkout.fields.preferredDateHint')"
                :error="form.errorFor('preferredDate') ? t(form.errorFor('preferredDate')!) : null"
              >
                <BaseInput
                  :id="id"
                  v-model="form.values.preferredDate"
                  type="date"
                  :min="minDate"
                  :described-by="describedBy"
                  :invalid="invalid"
                />
              </BaseField>
            </fieldset>

            <fieldset class="pk-checkout__fieldset">
              <legend class="pk-checkout__legend">
                {{ t('checkout.sectionNote') }}
              </legend>

              <BaseField
                v-slot="{ id, describedBy, invalid }"
                :label="t('checkout.fields.note')"
                :optional-label="t('common.optional')"
                :error="form.errorFor('note') ? t(form.errorFor('note')!) : null"
              >
                <BaseTextarea
                  :id="id"
                  v-model="form.values.note"
                  :rows="4"
                  :maxlength="500"
                  :placeholder="t('checkout.fields.notePlaceholder')"
                  :described-by="describedBy"
                  :invalid="invalid"
                />
              </BaseField>
            </fieldset>

            <BaseNotice v-if="form.formError.value" tone="danger" assertive>
              {{ t(form.formError.value) }}
            </BaseNotice>

            <BaseButton
              type="submit"
              variant="accent"
              size="lg"
              block
              :loading="form.isSubmitting.value"
              icon-trailing="ph:arrow-right-bold"
            >
              {{ form.isSubmitting.value ? t('checkout.submitting') : t('checkout.submit') }}
            </BaseButton>
          </form>

          <aside class="pk-checkout__aside">
            <div class="pk-checkout__summary">
              <h2 class="pk-checkout__summaryTitle">
                {{ t('checkout.orderSummary') }}
              </h2>

              <ul class="pk-checkout__items">
                <li v-for="line in cart.lines" :key="line.slug">
                  <span class="pk-checkout__itemName">{{ line.name }}</span>
                  <span class="pk-checkout__itemQty">&times;{{ line.quantity }}</span>
                  <span class="pk-checkout__itemPrice">{{ money(line.priceIdr * line.quantity) }}</span>
                </li>
              </ul>

              <dl class="pk-checkout__totals">
                <div>
                  <dt>{{ t('cart.subtotal') }}</dt>
                  <dd>{{ money(cart.subtotalIdr) }}</dd>
                </div>
                <div>
                  <dt>{{ t('cart.deliveryFee') }}</dt>
                  <dd v-if="!isDelivery || cart.deliveryFeeIdr === 0">
                    {{ t('common.free') }}
                  </dd>
                  <dd v-else>
                    {{ money(cart.deliveryFeeIdr) }}
                  </dd>
                </div>
                <div class="pk-checkout__grandTotal">
                  <dt>{{ t('cart.estimatedTotal') }}</dt>
                  <dd>{{ money(total) }}</dd>
                </div>
              </dl>

              <p class="pk-checkout__summaryNote">
                {{ t('cart.deliveryFeeNote') }}
              </p>
            </div>
          </aside>
        </div>

        <template #fallback>
          <div class="pk-checkout__skeleton pk-skeleton" />
        </template>
      </ClientOnly>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-checkout__crumbs {
  margin-block-end: var(--pk-space-5);
}

.pk-checkout__empty,
.pk-checkout__grid {
  margin-block-start: var(--pk-space-7);
}

.pk-checkout__grid {
  display: grid;
  gap: fluid(24px, 48px);
  grid-template-columns: 1fr;
  align-items: start;

  @include up('lg') {
    grid-template-columns: 1.5fr 1fr;
  }
}

.pk-checkout__form {
  display: flex;
  flex-direction: column;
  gap: var(--pk-space-5);
}

.pk-checkout__fieldset {
  display: flex;
  flex-direction: column;
  padding: var(--pk-space-5);
  border: 1px solid var(--pk-border);
  background: var(--pk-bg-raised);
  border-radius: var(--pk-radius-lg);
  gap: var(--pk-space-4);
}

.pk-checkout__legend {
  @include eyebrow;

  padding-inline: var(--pk-space-2);
  color: var(--pk-caramel-700);
}

.pk-checkout__row {
  display: grid;
  gap: var(--pk-space-4);
  grid-template-columns: 1fr;

  @include up('sm') {
    grid-template-columns: repeat(2, 1fr);
  }
}

.pk-checkout__methods {
  display: grid;
  gap: var(--pk-space-3);
  grid-template-columns: 1fr;

  @include up('sm') {
    grid-template-columns: repeat(2, 1fr);
  }
}

.pk-checkout__method {
  display: flex;
  flex-direction: column;
  padding: var(--pk-space-4);
  border: 1px solid var(--pk-border);
  background: var(--pk-cream-50);
  border-radius: var(--pk-radius-md);
  cursor: pointer;
  gap: 4px;
  transition:
    border-color var(--pk-duration-fast) var(--pk-ease-out),
    background-color var(--pk-duration-fast) var(--pk-ease-out);

  &:has(:focus-visible) {
    outline: 2px solid var(--pk-focus);
    outline-offset: 3px;
  }

  &.is-active {
    border-color: var(--pk-caramel-500);
    background: var(--pk-caramel-100);
  }
}

.pk-checkout__methodLabel {
  color: var(--pk-plum-800);
  font-size: rem(15px);
  font-weight: 700;
}

.pk-checkout__methodHint {
  color: var(--pk-text-muted);
  font-size: rem(12.5px);
  line-height: var(--pk-leading-snug);
}

// ── Summary ──────────────────────────────────────────────────────────────────

.pk-checkout__aside {
  @include up('lg') {
    position: sticky;
    inset-block-start: calc(var(--pk-header-height) + var(--pk-space-5));
  }
}

.pk-checkout__summary {
  display: flex;
  flex-direction: column;
  padding: var(--pk-space-5);
  gap: var(--pk-space-4);

  @include surface(var(--pk-radius-xl), var(--pk-shadow-sm));
}

.pk-checkout__summaryTitle {
  font-family: var(--pk-font-display);
  font-size: rem(20px);
  color: var(--pk-plum-800);
}

.pk-checkout__items {
  display: flex;
  flex-direction: column;
  gap: var(--pk-space-3);

  li {
    display: grid;
    align-items: baseline;
    gap: var(--pk-space-2);
    grid-template-columns: 1fr auto auto;
    font-size: rem(13.5px);
  }
}

.pk-checkout__itemName {
  color: var(--pk-ink-700);
  font-weight: 600;
}

.pk-checkout__itemQty {
  color: var(--pk-text-subtle);
  font-variant-numeric: tabular-nums;
}

.pk-checkout__itemPrice {
  color: var(--pk-plum-800);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.pk-checkout__totals {
  display: flex;
  flex-direction: column;
  padding-block-start: var(--pk-space-4);
  border-block-start: 1px solid var(--pk-border);
  gap: var(--pk-space-2);

  > div {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    color: var(--pk-text-muted);
    font-size: rem(14px);
    gap: var(--pk-space-3);
  }

  dd {
    color: var(--pk-ink-700);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
}

// Scoped under the parent so it beats `.pk-checkout__totals > div` on
// specificity rather than with `!important`.
.pk-checkout__totals > .pk-checkout__grandTotal {
  padding-block-start: var(--pk-space-3);
  border-block-start: 1px dashed var(--pk-border);
  color: var(--pk-plum-800);
  font-size: rem(16px);
  font-weight: 700;

  dd {
    color: var(--pk-plum-800);
    font-size: rem(20px);
    font-weight: 800;
  }
}

.pk-checkout__summaryNote {
  color: var(--pk-text-subtle);
  font-size: rem(12px);
  line-height: var(--pk-leading-normal);
}

.pk-checkout__skeleton {
  min-height: 30rem;
  border-radius: var(--pk-radius-xl);
  margin-block-start: var(--pk-space-7);
}
</style>
