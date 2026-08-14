<script setup lang="ts">
import { PRIMARY_NAV } from '~/constants/navigation'
import { useCartStore } from '~/stores/cart'

/**
 * Sticky header.
 *
 * Two behaviours worth knowing about:
 *  - It gains a frosted background only after the page scrolls, so the hero
 *    stays uninterrupted at the top.
 *  - The cart count is rendered from a hydration-safe flag: before the cart is
 *    restored from localStorage the badge renders as empty on both server and
 *    client, which avoids a hydration mismatch and the flash it causes.
 */

const { t } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const cart = useCartStore()

const isMenuOpen = ref(false)
const isScrolled = ref(false)

const { y } = useWindowScroll()
watch(y, (value) => { isScrolled.value = value > 12 }, { immediate: true })

// Any navigation closes the mobile sheet, including a back/forward gesture.
watch(() => route.fullPath, () => { isMenuOpen.value = false })

const cartCount = computed(() => (cart.isHydrated ? cart.itemCount : 0))

const navItems = computed(() =>
  PRIMARY_NAV.map(item => ({
    ...item,
    path: localePath(item.route),
    label: t(item.labelKey),
  })),
)

const isCurrent = (path: string) =>
  route.path === path || (path !== localePath('/') && route.path.startsWith(`${path}/`))
</script>

<template>
  <header class="pk-header" :class="{ 'is-scrolled': isScrolled }">
    <div class="pk-header__inner pk-container--wide">
      <NuxtLink :to="localePath('/')" class="pk-header__brand" :aria-label="t('site.name')">
        <BrandMark size="sm" />
      </NuxtLink>

      <nav class="pk-header__nav" :aria-label="t('nav.menu')">
        <NuxtLink
          v-for="item in navItems"
          :key="item.route"
          :to="item.path"
          class="pk-header__link"
          :class="{ 'is-current': isCurrent(item.path) }"
          :aria-current="isCurrent(item.path) ? 'page' : undefined"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <div class="pk-header__actions">
        <LanguageSwitcher class="pk-header__lang" />

        <button
          type="button"
          class="pk-header__cart"
          :aria-label="t('cart.openCart', { count: cartCount })"
          @click="cart.openDrawer()"
        >
          <Icon name="ph:shopping-bag-duotone" aria-hidden="true" />
          <span v-if="cartCount > 0" class="pk-header__count">{{ cartCount }}</span>
        </button>

        <button
          type="button"
          class="pk-header__burger"
          :aria-expanded="isMenuOpen"
          aria-controls="pk-mobile-menu"
          :aria-label="isMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')"
          @click="isMenuOpen = !isMenuOpen"
        >
          <Icon :name="isMenuOpen ? 'ph:x-bold' : 'ph:list-bold'" aria-hidden="true" />
        </button>
      </div>
    </div>

    <MobileMenu id="pk-mobile-menu" v-model:open="isMenuOpen" :items="navItems" />
  </header>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-header {
  position: sticky;
  z-index: var(--pk-z-header);
  inset-block-start: 0;
  transition:
    background-color var(--pk-duration-base) var(--pk-ease-out),
    box-shadow var(--pk-duration-base) var(--pk-ease-out),
    border-color var(--pk-duration-base) var(--pk-ease-out);
  border-block-end: 1px solid transparent;

  &.is-scrolled {
    @include glass(0.86, 16px);

    border-block-end-color: var(--pk-border);
    box-shadow: var(--pk-shadow-sm);
  }
}

.pk-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: var(--pk-header-height);
  gap: var(--pk-space-4);
}

.pk-header__brand {
  flex-shrink: 0;

  @include focus-ring(4px);
  @include jelly(1.04);
}

.pk-header__nav {
  display: none;
  gap: var(--pk-space-6);

  @include up('lg') {
    display: flex;
  }
}

.pk-header__link {
  @include underline-grow(var(--pk-caramel-500), 2px);
  @include focus-ring(4px);

  color: var(--pk-ink-700);
  font-size: rem(15px);
  font-weight: 600;
  transition: color var(--pk-duration-fast) var(--pk-ease-out);

  @include hover-capable {
    &:hover {
      color: var(--pk-plum-700);
    }
  }

  &.is-current {
    color: var(--pk-plum-700);
    font-weight: 700;

    &::after {
      transform: scaleX(1);
    }
  }
}

.pk-header__actions {
  display: flex;
  align-items: center;
  gap: var(--pk-space-3);
}

.pk-header__lang {
  display: none;

  @include up('sm') {
    display: inline-flex;
  }
}

.pk-header__cart {
  position: relative;
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid var(--pk-border);
  background: var(--pk-bg-raised);
  border-radius: var(--pk-radius-pill);
  color: var(--pk-plum-700);
  font-size: rem(20px);
  place-items: center;

  @include focus-ring(3px);
  @include jelly(1.08);

  @include hover-capable {
    &:hover {
      border-color: var(--pk-caramel-400);
      background: var(--pk-caramel-100);
    }
  }
}

.pk-header__count {
  position: absolute;
  display: grid;
  min-width: 1.25rem;
  height: 1.25rem;
  padding-inline: 0.25rem;
  background: var(--pk-berry);
  border-radius: var(--pk-radius-pill);
  color: #fff;
  font-size: rem(11px);
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  inset-block-start: -4px;
  inset-inline-end: -4px;
  place-items: center;

  @include motion-safe {
    animation: pk-wobble 520ms var(--pk-ease-jelly);
  }
}

.pk-header__burger {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid var(--pk-border);
  background: var(--pk-bg-raised);
  border-radius: var(--pk-radius-pill);
  color: var(--pk-plum-700);
  font-size: rem(20px);
  place-items: center;

  @include focus-ring(3px);

  @include up('lg') {
    display: none;
  }
}
</style>
