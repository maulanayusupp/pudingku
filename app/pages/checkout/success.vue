<script setup lang="ts">
import { useOrderStore } from '~/stores/order'
import { formatDateTime } from '~/utils/format'
import { SITE, confirmed } from '#shared/config/site'

/**
 * Order confirmation.
 *
 * Deliberately does NOT say "order received" — nothing was received. It presents
 * the calculated summary and a reference, and tells the visitor the one step
 * that actually places the order today: emailing us that reference. A prefilled
 * `mailto:` link makes that a single tap.
 */

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { money } = useMoney()
const orders = useOrderStore()

onMounted(() => orders.restore())

const order = computed(() => orders.lastOrder)
const contactEmail = confirmed(SITE.email) ?? ''

const mailtoHref = computed(() => {
  if (!order.value || !contactEmail) return ''
  const subject = t('checkout.success.emailSubject', { reference: order.value.reference })
  const body = t('checkout.success.emailBody', { reference: order.value.reference })
  return `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
})

useSeoPage(() => ({
  title: t('checkout.success.title'),
  description: t('checkout.meta.description'),
  noindex: true,
}))
</script>

<template>
  <div class="pk-success pk-section">
    <div class="pk-container--narrow">
      <ClientOnly>
        <div v-if="order" class="pk-success__panel">
          <span class="pk-success__mark" aria-hidden="true">
            <Icon name="ph:receipt-duotone" />
          </span>

          <h1 class="pk-success__title">
            {{ t('checkout.success.title') }}
          </h1>

          <div class="pk-success__reference">
            <p class="pk-success__referenceLabel">
              {{ t('checkout.success.reference') }}
            </p>
            <p class="pk-success__referenceValue">
              {{ order.reference }}
            </p>
            <p class="pk-success__createdAt">
              {{ t('checkout.success.createdAt') }}: {{ formatDateTime(order.createdAt, locale) }}
            </p>
          </div>

          <BaseNotice tone="warning" :title="t('checkout.demoNoticeTitle')">
            {{ t('checkout.success.body', { email: contactEmail }) }}
          </BaseNotice>

          <section class="pk-success__summary" :aria-label="t('checkout.orderSummary')">
            <h2 class="pk-success__summaryTitle">
              {{ t('checkout.orderSummary') }}
            </h2>

            <ul class="pk-success__lines">
              <li v-for="line in order.lines" :key="line.slug">
                <span class="pk-success__lineName">{{ line.name }}</span>
                <span class="pk-success__lineQty">&times;{{ line.quantity }}</span>
                <span class="pk-success__linePrice">{{ money(line.subtotalIdr) }}</span>
              </li>
            </ul>

            <dl class="pk-success__totals">
              <div>
                <dt>{{ t('cart.subtotal') }}</dt>
                <dd>{{ money(order.subtotalIdr) }}</dd>
              </div>
              <div>
                <dt>{{ t('cart.deliveryFee') }}</dt>
                <dd>
                  <span v-if="order.deliveryFeeIdr === 0">{{ t('common.free') }}</span>
                  <span v-else>{{ money(order.deliveryFeeIdr) }}</span>
                </dd>
              </div>
              <div class="pk-success__grand">
                <dt>{{ t('common.total') }}</dt>
                <dd>{{ money(order.totalIdr) }}</dd>
              </div>
            </dl>
          </section>

          <div class="pk-success__actions">
            <BaseButton v-if="mailtoHref" :href="mailtoHref" variant="accent" size="lg" icon="ph:envelope-simple-duotone">
              {{ t('checkout.success.emailCta') }}
            </BaseButton>
            <BaseButton :to="localePath('/')" variant="outline" size="lg">
              {{ t('checkout.success.backHome') }}
            </BaseButton>
          </div>
        </div>

        <EmptyState
          v-else
          :title="t('checkout.success.noOrderTitle')"
          :body="t('checkout.success.noOrderBody')"
          icon="ph:receipt-duotone"
        >
          <BaseButton :to="localePath('/produk')" variant="accent">
            {{ t('cart.emptyCta') }}
          </BaseButton>
        </EmptyState>

        <template #fallback>
          <div class="pk-success__skeleton pk-skeleton" />
        </template>
      </ClientOnly>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-success__panel {
  display: flex;
  flex-direction: column;
  padding: fluid(24px, 48px);
  gap: var(--pk-space-5);

  @include surface(var(--pk-radius-xl), var(--pk-shadow-md));
}

.pk-success__mark {
  display: grid;
  width: 4.5rem;
  height: 4.5rem;
  background: linear-gradient(140deg, var(--pk-caramel-300), var(--pk-caramel-100));
  border-radius: var(--pk-radius-blob);
  color: var(--pk-plum-700);
  font-size: rem(30px);
  place-items: center;

  @include motion-safe {
    animation: pk-blob-morph 10s var(--pk-ease-in-out) infinite;
  }
}

.pk-success__title {
  @include display(26px, 40px);

  color: var(--pk-plum-800);
}

.pk-success__reference {
  padding: var(--pk-space-4);
  border: 1px dashed var(--pk-caramel-400);
  background: var(--pk-caramel-100);
  border-radius: var(--pk-radius-md);
}

.pk-success__referenceLabel {
  @include eyebrow;

  color: var(--pk-caramel-700);
}

.pk-success__referenceValue {
  font-family: var(--pk-font-mono);
  font-size: fluid(24px, 32px);
  font-weight: 700;
  color: var(--pk-plum-800);
  letter-spacing: 0.06em;
  margin-block: var(--pk-space-1);
}

.pk-success__createdAt {
  color: var(--pk-text-muted);
  font-size: rem(12.5px);
}

.pk-success__summary {
  padding-block-start: var(--pk-space-4);
  border-block-start: 1px solid var(--pk-border);
}

.pk-success__summaryTitle {
  @include eyebrow;

  color: var(--pk-plum-700);
  margin-block-end: var(--pk-space-3);
}

.pk-success__lines {
  display: flex;
  flex-direction: column;
  gap: var(--pk-space-2);

  li {
    display: grid;
    align-items: baseline;
    gap: var(--pk-space-2);
    grid-template-columns: 1fr auto auto;
    font-size: rem(14px);
  }
}

.pk-success__lineName {
  color: var(--pk-ink-700);
  font-weight: 600;
}

.pk-success__lineQty {
  color: var(--pk-text-subtle);
  font-variant-numeric: tabular-nums;
}

.pk-success__linePrice {
  color: var(--pk-plum-800);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.pk-success__totals {
  display: flex;
  flex-direction: column;
  padding-block-start: var(--pk-space-3);
  margin-block-start: var(--pk-space-3);
  border-block-start: 1px dashed var(--pk-border);
  gap: var(--pk-space-2);

  > div {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    color: var(--pk-text-muted);
    font-size: rem(14px);
  }

  dd {
    color: var(--pk-ink-700);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
}

.pk-success__grand {
  color: var(--pk-plum-800) !important;
  font-weight: 700;

  dd {
    color: var(--pk-plum-800);
    font-size: rem(20px);
    font-weight: 800;
  }
}

.pk-success__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--pk-space-3);
}

.pk-success__skeleton {
  min-height: 26rem;
  border-radius: var(--pk-radius-xl);
}
</style>
