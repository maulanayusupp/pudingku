<script setup lang="ts">
import { contactService } from '~/services/contact.service'
import { email as emailRule, maxLength, minLength, required } from '~/utils/validation'
import { SITE, confirmed } from '#shared/config/site'
import type { Schema } from '~/utils/validation'

/**
 * Contact page.
 *
 * The direct email address is presented ABOVE the form, and the form itself
 * carries a notice explaining that no mail provider is connected yet. That
 * ordering is deliberate: the reliable channel should be the one a visitor sees
 * first. Once an email service is wired up, remove the notice and move the form
 * to the top.
 */

const { t } = useI18n()
const localePath = useLocalePath()

const contactEmail = confirmed(SITE.email)
const owner = confirmed(SITE.owner)
const phone = confirmed(SITE.phone)
const address = confirmed(SITE.addressStreet)

interface ContactValues extends Record<string, string> {
  name: string
  email: string
  subject: string
  message: string
}

const schema: Schema<ContactValues> = {
  name: [required(), minLength(2)],
  email: [required(), emailRule()],
  subject: [required(), minLength(3), maxLength(120)],
  message: [required(), minLength(10), maxLength(4000)],
}

const form = useForm<ContactValues, Awaited<ReturnType<typeof contactService.send>>>({
  initial: { name: '', email: '', subject: '', message: '' },
  schema,
  submit: values => contactService.send(values),
})

const infoRows = computed(() => [
  owner ? { label: t('contact.infoOwner'), value: owner, icon: 'ph:user-duotone', href: null } : null,
  contactEmail ? { label: t('contact.infoEmail'), value: contactEmail, icon: 'ph:envelope-simple-duotone', href: `mailto:${contactEmail}` } : null,
  phone ? { label: t('common.phone'), value: phone, icon: 'ph:phone-duotone', href: `tel:${phone}` } : null,
  { label: t('contact.infoHours'), value: t('contact.infoHoursValue'), icon: 'ph:clock-duotone', href: null },
  {
    label: t('contact.infoLocation'),
    value: address ?? t('contact.infoLocationPending'),
    icon: 'ph:map-pin-duotone',
    href: null,
  },
].filter(Boolean) as { label: string, value: string, icon: string, href: string | null }[])

useSeoPage(() => ({
  title: t('contact.meta.title'),
  description: t('contact.meta.description'),
}))
</script>

<template>
  <div class="pk-contact pk-section">
    <div class="pk-container--wide">
      <BreadcrumbTrail
        class="pk-contact__crumbs"
        :items="[
          { label: t('nav.home'), to: localePath('/') },
          { label: t('nav.contact') },
        ]"
      />

      <SectionHeading
        :eyebrow="t('contact.eyebrow')"
        :title="t('contact.title')"
        :description="t('contact.description')"
        :level="1"
      />

      <div class="pk-contact__grid">
        <aside class="pk-contact__aside">
          <div class="pk-contact__direct">
            <h2 class="pk-contact__directTitle">
              <Icon name="ph:paper-plane-tilt-duotone" aria-hidden="true" />
              {{ t('contact.directTitle') }}
            </h2>

            <p class="pk-contact__directBody">
              {{ t('contact.directBody') }}
            </p>

            <BaseButton
              v-if="contactEmail"
              :href="`mailto:${contactEmail}`"
              variant="accent"
              block
              icon="ph:envelope-simple-duotone"
            >
              {{ contactEmail }}
            </BaseButton>
          </div>

          <dl class="pk-contact__info">
            <div v-for="row in infoRows" :key="row.label" class="pk-contact__infoRow">
              <dt>
                <Icon :name="row.icon" aria-hidden="true" />
                {{ row.label }}
              </dt>
              <dd>
                <a v-if="row.href" :href="row.href" class="pk-contact__infoLink">{{ row.value }}</a>
                <span v-else>{{ row.value }}</span>
              </dd>
            </div>
          </dl>

          <p v-if="!phone" class="pk-contact__pending">
            {{ t('contact.infoPhonePending') }}
          </p>
        </aside>

        <div class="pk-contact__formWrap">
          <BaseNotice tone="info" :title="t('contact.formNoticeTitle')">
            {{ t('contact.formNoticeBody') }}
          </BaseNotice>

          <BaseNotice
            v-if="form.status.value === 'success' && form.result.value"
            tone="success"
            assertive
            :title="t('contact.successTitle')"
          >
            {{ t('contact.successBody', { reference: form.result.value.reference, email: contactEmail }) }}
          </BaseNotice>

          <form v-if="form.status.value !== 'success'" class="pk-contact__form" novalidate @submit.prevent="form.handleSubmit">
            <h2 class="pk-contact__formTitle">
              {{ t('contact.formTitle') }}
            </h2>

            <div class="pk-contact__row">
              <BaseField
                v-slot="{ id, describedBy, invalid }"
                :label="t('contact.fields.name')"
                :error="form.errorFor('name') ? t(form.errorFor('name')!) : null"
                required
              >
                <BaseInput
                  :id="id"
                  v-model="form.values.name"
                  :placeholder="t('contact.fields.namePlaceholder')"
                  :described-by="describedBy"
                  :invalid="invalid"
                  autocomplete="name"
                  @blur="form.validateField('name')"
                />
              </BaseField>

              <BaseField
                v-slot="{ id, describedBy, invalid }"
                :label="t('contact.fields.email')"
                :error="form.errorFor('email') ? t(form.errorFor('email')!) : null"
                required
              >
                <BaseInput
                  :id="id"
                  v-model="form.values.email"
                  type="email"
                  inputmode="email"
                  :placeholder="t('contact.fields.emailPlaceholder')"
                  :described-by="describedBy"
                  :invalid="invalid"
                  autocomplete="email"
                  @blur="form.validateField('email')"
                />
              </BaseField>
            </div>

            <BaseField
              v-slot="{ id, describedBy, invalid }"
              :label="t('contact.fields.subject')"
              :error="form.errorFor('subject') ? t(form.errorFor('subject')!) : null"
              required
            >
              <BaseInput
                :id="id"
                v-model="form.values.subject"
                :placeholder="t('contact.fields.subjectPlaceholder')"
                :described-by="describedBy"
                :invalid="invalid"
                @blur="form.validateField('subject')"
              />
            </BaseField>

            <BaseField
              v-slot="{ id, describedBy, invalid }"
              :label="t('contact.fields.message')"
              :error="form.errorFor('message') ? t(form.errorFor('message')!) : null"
              required
            >
              <BaseTextarea
                :id="id"
                v-model="form.values.message"
                :rows="6"
                :maxlength="4000"
                :placeholder="t('contact.fields.messagePlaceholder')"
                :described-by="describedBy"
                :invalid="invalid"
                @blur="form.validateField('message')"
              />
            </BaseField>

            <BaseNotice v-if="form.formError.value" tone="danger" assertive>
              {{ t(form.formError.value) }}
            </BaseNotice>

            <BaseButton
              type="submit"
              variant="primary"
              size="lg"
              :loading="form.isSubmitting.value"
              icon-trailing="ph:paper-plane-tilt-bold"
            >
              {{ form.isSubmitting.value ? t('common.sending') : t('contact.submit') }}
            </BaseButton>
          </form>

          <BaseButton
            v-else
            variant="outline"
            size="sm"
            icon="ph:arrow-counter-clockwise-bold"
            @click="form.reset"
          >
            {{ t('contact.sendAnother') }}
          </BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-contact__crumbs {
  margin-block-end: var(--pk-space-5);
}

.pk-contact__grid {
  display: grid;
  gap: fluid(24px, 48px);
  grid-template-columns: 1fr;
  align-items: start;
  margin-block-start: var(--pk-space-7);

  @include up('lg') {
    grid-template-columns: 0.85fr 1.15fr;
  }
}

.pk-contact__aside {
  display: flex;
  flex-direction: column;
  gap: var(--pk-space-5);

  @include up('lg') {
    position: sticky;
    inset-block-start: calc(var(--pk-header-height) + var(--pk-space-5));
  }
}

.pk-contact__direct {
  display: flex;
  flex-direction: column;
  padding: var(--pk-space-5);
  border: 1px solid var(--pk-caramel-300);
  background: linear-gradient(150deg, var(--pk-caramel-100), var(--pk-cream-100));
  border-radius: var(--pk-radius-xl);
  gap: var(--pk-space-3);
}

.pk-contact__directTitle {
  display: flex;
  align-items: center;
  font-family: var(--pk-font-display);
  font-size: rem(21px);
  color: var(--pk-plum-800);
  gap: 0.4em;
}

.pk-contact__directBody {
  color: var(--pk-ink-700);
  font-size: rem(14px);
  line-height: var(--pk-leading-relaxed);
}

.pk-contact__info {
  display: flex;
  flex-direction: column;
  padding: var(--pk-space-5);
  gap: var(--pk-space-4);

  @include surface(var(--pk-radius-lg), var(--pk-shadow-xs));
}

.pk-contact__infoRow {
  display: flex;
  flex-direction: column;
  gap: 4px;

  dt {
    display: flex;
    align-items: center;
    color: var(--pk-text-subtle);
    font-size: rem(11px);
    font-weight: 700;
    gap: 0.4em;
    letter-spacing: var(--pk-tracking-wide);
    text-transform: uppercase;
  }

  dd {
    color: var(--pk-ink-700);
    font-size: rem(14.5px);
    line-height: var(--pk-leading-normal);
  }
}

.pk-contact__infoLink {
  color: var(--pk-plum-700);
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 0.16em;

  @include focus-ring(3px);
}

.pk-contact__pending {
  color: var(--pk-text-subtle);
  font-size: rem(12.5px);
  line-height: var(--pk-leading-normal);
}

.pk-contact__formWrap {
  display: flex;
  flex-direction: column;
  gap: var(--pk-space-4);
}

.pk-contact__form {
  display: flex;
  flex-direction: column;
  padding: fluid(20px, 32px);
  gap: var(--pk-space-4);

  @include surface(var(--pk-radius-xl), var(--pk-shadow-sm));
}

.pk-contact__formTitle {
  font-family: var(--pk-font-display);
  font-size: fluid(20px, 26px);
  color: var(--pk-plum-800);
}

.pk-contact__row {
  display: grid;
  gap: var(--pk-space-4);
  grid-template-columns: 1fr;

  @include up('sm') {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
