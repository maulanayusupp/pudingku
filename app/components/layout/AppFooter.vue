<script setup lang="ts">
import { COMPLIANCE_DOCS, FOOTER_COMPANY_NAV, FOOTER_SHOP_NAV } from '~/constants/navigation'
import { SITE, confirmed } from '#shared/config/site'

/**
 * Footer.
 *
 * Contact rows are driven by `shared/config/site.ts`: a value that the owner has
 * not confirmed is simply not rendered, so the footer never shows a placeholder
 * phone number or a made-up address.
 */

const { t } = useI18n()
const localePath = useLocalePath()

const year = new Date().getFullYear()

const shopLinks = computed(() =>
  FOOTER_SHOP_NAV.map(item => ({ ...item, path: localePath(item.route), label: t(item.labelKey) })),
)

const companyLinks = computed(() =>
  FOOTER_COMPANY_NAV.map(item => ({ ...item, path: localePath(item.route), label: t(item.labelKey) })),
)

const legalLinks = computed(() =>
  COMPLIANCE_DOCS.map(doc => ({
    key: doc,
    path: localePath(`/kepatuhan/${doc}`),
    label: t(`compliance.docs.${doc}.title`),
  })),
)

const email = confirmed(SITE.email)
const owner = confirmed(SITE.owner)
const phone = confirmed(SITE.phone)
const address = confirmed(SITE.addressStreet)
</script>

<template>
  <footer class="pk-footer">
    <span class="pk-footer__drip" aria-hidden="true" />

    <div class="pk-footer__inner pk-container--wide">
      <div class="pk-footer__brand">
        <BrandMark size="md" class="pk-footer__mark" />
        <p class="pk-footer__tagline">
          {{ t('footer.tagline') }}
        </p>

        <div class="pk-footer__lang">
          <LanguageSwitcher />
        </div>
      </div>

      <nav class="pk-footer__column" :aria-label="t('footer.shop')">
        <h2 class="pk-footer__heading">
          {{ t('footer.shop') }}
        </h2>
        <ul>
          <li v-for="link in shopLinks" :key="link.route">
            <NuxtLink :to="link.path" class="pk-footer__link">
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <nav class="pk-footer__column" :aria-label="t('footer.company')">
        <h2 class="pk-footer__heading">
          {{ t('footer.company') }}
        </h2>
        <ul>
          <li v-for="link in companyLinks" :key="link.route">
            <NuxtLink :to="link.path" class="pk-footer__link">
              {{ link.label }}
            </NuxtLink>
          </li>
          <li>
            <NuxtLink :to="localePath('/kepatuhan')" class="pk-footer__link">
              {{ t('nav.compliance') }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <nav class="pk-footer__column" :aria-label="t('footer.legal')">
        <h2 class="pk-footer__heading">
          {{ t('footer.legal') }}
        </h2>
        <ul>
          <li v-for="link in legalLinks" :key="link.key">
            <NuxtLink :to="link.path" class="pk-footer__link">
              {{ link.label }}
            </NuxtLink>
          </li>
        </ul>
      </nav>

      <div class="pk-footer__column pk-footer__column--contact">
        <h2 class="pk-footer__heading">
          {{ t('footer.contactHeading') }}
        </h2>

        <ul class="pk-footer__contact">
          <li v-if="owner">
            <span class="pk-footer__contactLabel">{{ t('footer.ownerLabel') }}</span>
            <span>{{ owner }}</span>
          </li>
          <li v-if="email">
            <span class="pk-footer__contactLabel">{{ t('common.email') }}</span>
            <a :href="`mailto:${email}`" class="pk-footer__link">{{ email }}</a>
          </li>
          <li v-if="phone">
            <span class="pk-footer__contactLabel">{{ t('common.phone') }}</span>
            <a :href="`tel:${phone}`" class="pk-footer__link">{{ phone }}</a>
          </li>
          <li v-if="address">
            <span class="pk-footer__contactLabel">{{ t('contact.infoLocation') }}</span>
            <span>{{ address }}</span>
          </li>
        </ul>

        <p class="pk-footer__note">
          <strong>{{ t('footer.newsletterHeading') }}</strong><br>
          {{ t('footer.newsletterBody') }}
        </p>
      </div>
    </div>

    <div class="pk-footer__bar pk-container--wide">
      <p>&copy; {{ year }} {{ t('site.name') }}. {{ t('footer.rights') }}</p>
      <p class="pk-footer__disclosure">
        {{ t('footer.builtNote') }}
      </p>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-footer {
  position: relative;
  padding-block-start: fluid(64px, 104px);
  background: var(--pk-plum-800);
  color: var(--pk-cream-200);
  margin-block-start: fluid(56px, 112px);

  @include grain(0.08, 0);
}

/// The caramel drip that separates the footer from the page above it.
.pk-footer__drip {
  position: absolute;
  display: block;
  height: 26px;
  background:
    radial-gradient(circle at 12px -6px, var(--pk-plum-800) 12px, transparent 13px) repeat-x 0 0 / 34px 26px;
  inset-block-start: -25px;
  inset-inline: 0;
}

.pk-footer__inner {
  position: relative;
  z-index: 2;
  display: grid;
  gap: var(--pk-space-8);
  grid-template-columns: 1fr;

  @include up('sm') {
    grid-template-columns: repeat(2, 1fr);
  }

  @include up('lg') {
    grid-template-columns: 1.6fr repeat(3, 1fr) 1.4fr;
    gap: var(--pk-space-6);
  }
}

.pk-footer__brand {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--pk-space-4);
}

.pk-footer__mark {
  color: var(--pk-cream-100);
}

.pk-footer__mark :deep(.pk-brand__word) {
  color: var(--pk-cream-100);
}

.pk-footer__tagline {
  max-width: 34ch;
  color: var(--pk-plum-100);
  font-size: rem(14px);
  line-height: var(--pk-leading-relaxed);
}

.pk-footer__heading {
  @include eyebrow;

  margin-block-end: var(--pk-space-4);
  color: var(--pk-caramel-300);
}

.pk-footer__column ul {
  display: flex;
  flex-direction: column;
  gap: var(--pk-space-2);
}

.pk-footer__link {
  color: var(--pk-cream-200);
  font-size: rem(14px);
  transition: color var(--pk-duration-fast) var(--pk-ease-out);

  @include focus-ring(3px, var(--pk-caramel-400));

  @include hover-capable {
    &:hover {
      color: var(--pk-caramel-300);
    }
  }
}

.pk-footer__contact {
  display: flex;
  flex-direction: column;
  gap: var(--pk-space-3);
  font-size: rem(14px);
}

.pk-footer__contact li {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.pk-footer__contactLabel {
  color: var(--pk-plum-300);
  font-size: rem(11px);
  font-weight: 700;
  letter-spacing: var(--pk-tracking-wide);
  text-transform: uppercase;
}

.pk-footer__note {
  padding: var(--pk-space-4);
  border: 1px solid rgb(231 211 224 / 18%);
  border-radius: var(--pk-radius-md);
  color: var(--pk-plum-100);
  font-size: rem(12.5px);
  line-height: var(--pk-leading-normal);
  margin-block-start: var(--pk-space-5);
}

.pk-footer__bar {
  position: relative;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  padding-block: var(--pk-space-5);
  border-block-start: 1px solid rgb(231 211 224 / 16%);
  color: var(--pk-plum-100);
  font-size: rem(12.5px);
  gap: var(--pk-space-3);
  margin-block-start: fluid(40px, 72px);
}

.pk-footer__disclosure {
  color: var(--pk-plum-300);
}
</style>
