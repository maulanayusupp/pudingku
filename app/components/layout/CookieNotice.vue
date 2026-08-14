<script setup lang="ts">
import { STORAGE_KEYS, readJson, writeJson } from '~/utils/storage'

/**
 * Cookie disclosure.
 *
 * Deliberately NOT a consent gate: the site sets no analytics or advertising
 * cookies, so there is nothing to consent to. It is an informational notice
 * that can be dismissed, and dismissal is remembered locally.
 * If a tracking script is ever added, this must be replaced by a real consent
 * manager — see TODO.md.
 */

const { t } = useI18n()
const localePath = useLocalePath()

const isVisible = ref(false)

onMounted(() => {
  isVisible.value = readJson<boolean>(STORAGE_KEYS.cookieConsent, false) !== true
})

const dismiss = () => {
  writeJson(STORAGE_KEYS.cookieConsent, true)
  isVisible.value = false
}
</script>

<template>
  <ClientOnly>
    <Transition name="pk-cookie">
      <aside v-if="isVisible" class="pk-cookie" :aria-label="t('cookieBanner.title')">
        <div class="pk-cookie__body">
          <p class="pk-cookie__title">
            <Icon name="ph:cookie-duotone" aria-hidden="true" />
            {{ t('cookieBanner.title') }}
          </p>
          <p class="pk-cookie__text">
            {{ t('cookieBanner.body') }}
            <NuxtLink :to="localePath('/kepatuhan/cookies')" class="pk-cookie__link">
              {{ t('cookieBanner.readPolicy') }}
            </NuxtLink>
          </p>
        </div>

        <BaseButton size="sm" variant="primary" @click="dismiss">
          {{ t('cookieBanner.accept') }}
        </BaseButton>
      </aside>
    </Transition>
  </ClientOnly>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-cookie {
  position: fixed;
  z-index: var(--pk-z-toast);
  display: flex;
  flex-direction: column;
  max-width: 34rem;
  padding: var(--pk-space-4);
  border: 1px solid var(--pk-border-strong);
  background: var(--pk-bg-raised);
  border-radius: var(--pk-radius-lg);
  box-shadow: var(--pk-shadow-lg);
  gap: var(--pk-space-3);
  inset-block-end: var(--pk-space-4);
  inset-inline: var(--pk-space-4);

  @include up('sm') {
    flex-direction: row;
    align-items: center;
    inset-inline-end: auto;
    inset-inline-start: var(--pk-space-5);
  }
}

.pk-cookie__title {
  display: flex;
  align-items: center;
  color: var(--pk-plum-800);
  font-size: rem(14px);
  font-weight: 700;
  gap: 0.4em;
}

.pk-cookie__text {
  color: var(--pk-text-muted);
  font-size: rem(13px);
  line-height: var(--pk-leading-normal);
}

.pk-cookie__link {
  color: var(--pk-plum-700);
  font-weight: 700;
  text-decoration: underline;
  text-underline-offset: 0.16em;
}

.pk-cookie-enter-active,
.pk-cookie-leave-active {
  transition:
    opacity var(--pk-duration-base) var(--pk-ease-out),
    transform var(--pk-duration-base) var(--pk-ease-out);
}

.pk-cookie-enter-from,
.pk-cookie-leave-to {
  opacity: 0;
  transform: translateY(14px);
}
</style>
