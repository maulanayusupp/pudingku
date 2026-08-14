<script setup lang="ts">
/**
 * The only layout.
 *
 * Holds the skip link, header, main landmark, footer, the cart drawer and the
 * cookie notice. Pages render inside `<main>` and never repeat this chrome.
 */

const { t } = useI18n()
</script>

<template>
  <div class="pk-shell">
    <a href="#pk-main" class="pk-skip-link">{{ t('nav.skipToContent') }}</a>

    <AppHeader />

    <main id="pk-main" class="pk-shell__main">
      <slot />
    </main>

    <AppFooter />

    <CartDrawer />
    <CookieNotice />
  </div>
</template>

<style lang="scss" scoped>
.pk-shell {
  display: flex;
  min-height: 100svh;
  flex-direction: column;
}

.pk-shell__main {
  flex: 1;
}
</style>
