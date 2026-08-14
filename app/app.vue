<script setup lang="ts">
import { SITE, confirmed } from '#shared/config/site'

/**
 * Root component.
 *
 * Sets the site-wide head defaults and the organisation structured data. Page
 * level SEO is handled by `useSeoPage()` inside each page, which overrides the
 * title template defined here.
 */

const config = useRuntimeConfig()
const { locale, t } = useI18n()
const siteUrl = String(config.public.siteUrl).replace(/\/$/, '')

useHead({
  titleTemplate: title => (title ? `${title} · ${SITE.name}` : `${SITE.name} — ${t('site.tagline')}`),
  htmlAttrs: { lang: locale },
})

const email = confirmed(SITE.email)

/**
 * Organisation schema.
 *
 * Only fields backed by confirmed data are emitted — no invented address,
 * telephone or opening hours. Structured data that contradicts reality is worse
 * than none at all.
 */
useSchemaOrg([
  defineOrganization({
    'name': SITE.name,
    'url': siteUrl,
    'logo': `${siteUrl}/icon-512.png`,
    'description': t('site.shortDescription'),
    'email': email ?? undefined,
    'founder': confirmed(SITE.owner) ?? undefined,
    'areaServed': 'ID',
    '@type': 'Organization',
  }),
  defineWebSite({
    name: SITE.name,
    inLanguage: locale.value,
  }),
])
</script>

<template>
  <div>
    <NuxtLoadingIndicator color="#d89a52" :height="3" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style lang="scss">
// Page + layout transitions. Global (not scoped) because Vue applies these
// classes to the routed component, which lives outside this component's scope.
.pk-page-enter-active,
.pk-page-leave-active {
  transition:
    opacity var(--pk-duration-base) var(--pk-ease-out),
    transform var(--pk-duration-base) var(--pk-ease-out);
}

.pk-page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.pk-page-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (prefers-reduced-motion: reduce) {
  .pk-page-enter-active,
  .pk-page-leave-active {
    transition: none;
  }

  .pk-page-enter-from,
  .pk-page-leave-to {
    transform: none;
  }
}
</style>
