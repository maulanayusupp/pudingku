<script setup lang="ts">
import { useCartStore } from '~/stores/cart'

/**
 * Slide-over cart.
 *
 * Accessibility contract:
 *  - `role="dialog"` + `aria-modal` so assistive tech treats the page behind it
 *    as inert.
 *  - Focus is trapped inside while open and returned to the trigger on close.
 *  - Escape and the backdrop both close it.
 *  - Page scroll is locked through the shared `useScrollLock` counter.
 */

const { t } = useI18n()
const localePath = useLocalePath()
const cart = useCartStore()

const panel = ref<HTMLElement | null>(null)
const isOpen = computed(() => cart.isDrawerOpen)

useScrollLock(isOpen as Ref<boolean>)
useDialogFocus(panel, isOpen as Ref<boolean>)

onKeyStroke('Escape', () => {
  if (isOpen.value) cart.closeDrawer()
})
</script>

<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition name="pk-fade">
        <div
          v-if="isOpen"
          class="pk-drawer__backdrop"
          @click="cart.closeDrawer()"
        />
      </Transition>

      <Transition name="pk-drawer">
        <aside
          v-if="isOpen"
          ref="panel"
          class="pk-drawer"
          role="dialog"
          aria-modal="true"
          :aria-label="t('cart.drawerTitle')"
        >
          <header class="pk-drawer__head">
            <h2 class="pk-drawer__title">
              {{ t('cart.drawerTitle') }}
              <span v-if="!cart.isEmpty" class="pk-drawer__count">
                {{ t('cart.itemCount', cart.itemCount, { count: cart.itemCount }) }}
              </span>
            </h2>

            <button
              type="button"
              class="pk-drawer__close"
              :aria-label="t('common.close')"
              @click="cart.closeDrawer()"
            >
              <Icon name="ph:x-bold" aria-hidden="true" />
            </button>
          </header>

          <div class="pk-drawer__body">
            <EmptyState
              v-if="cart.isEmpty"
              :title="t('cart.empty')"
              :body="t('cart.emptyBody')"
              icon="ph:shopping-bag-open-duotone"
            >
              <BaseButton :to="localePath('/produk')" size="sm" @click="cart.closeDrawer()">
                {{ t('cart.emptyCta') }}
              </BaseButton>
            </EmptyState>

            <ul v-else class="pk-drawer__lines">
              <CartLineItem
                v-for="line in cart.lines"
                :key="line.slug"
                :line="line"
                dense
              />
            </ul>
          </div>

          <footer v-if="!cart.isEmpty" class="pk-drawer__foot">
            <CartSummary hide-action />

            <div class="pk-drawer__actions">
              <BaseButton
                :to="localePath('/checkout')"
                variant="accent"
                block
                icon-trailing="ph:arrow-right-bold"
                @click="cart.closeDrawer()"
              >
                {{ t('cart.checkout') }}
              </BaseButton>

              <BaseButton
                :to="localePath('/keranjang')"
                variant="ghost"
                size="sm"
                block
                @click="cart.closeDrawer()"
              >
                {{ t('cart.title') }}
              </BaseButton>
            </div>
          </footer>
        </aside>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-drawer__backdrop {
  position: fixed;
  z-index: var(--pk-z-overlay);
  background: rgb(31 10 24 / 46%);
  backdrop-filter: blur(3px);
  inset: 0;
}

.pk-drawer {
  position: fixed;
  z-index: var(--pk-z-drawer);
  display: flex;
  width: min(30rem, 100vw);
  flex-direction: column;
  background: var(--pk-bg);
  box-shadow: var(--pk-shadow-lg);
  inset-block: 0;
  inset-inline-end: 0;

  @include up('sm') {
    border-start-start-radius: var(--pk-radius-xl);
    border-end-start-radius: var(--pk-radius-xl);
  }
}

.pk-drawer__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--pk-space-5);
  border-block-end: 1px solid var(--pk-border);
  gap: var(--pk-space-3);
}

.pk-drawer__title {
  display: flex;
  flex-direction: column;
  font-family: var(--pk-font-display);
  font-size: rem(22px);
  color: var(--pk-plum-800);
  gap: 2px;
}

.pk-drawer__count {
  color: var(--pk-text-muted);
  font-family: var(--pk-font-body);
  font-size: rem(13px);
  font-weight: 500;
}

.pk-drawer__close {
  display: grid;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid var(--pk-border);
  background: var(--pk-bg-raised);
  border-radius: var(--pk-radius-pill);
  color: var(--pk-plum-700);
  place-items: center;

  @include focus-ring(3px);
  @include jelly(1.08);
}

.pk-drawer__body {
  flex: 1;
  overflow-y: auto;
  padding: var(--pk-space-4) var(--pk-space-5);
  overscroll-behavior: contain;
}

.pk-drawer__foot {
  display: flex;
  flex-direction: column;
  padding: var(--pk-space-4) var(--pk-space-5) var(--pk-space-5);
  border-block-start: 1px solid var(--pk-border);
  background: var(--pk-bg-raised);
  gap: var(--pk-space-4);
}

.pk-drawer__actions {
  display: flex;
  flex-direction: column;
  gap: var(--pk-space-2);
}

// Transitions
.pk-fade-enter-active,
.pk-fade-leave-active {
  transition: opacity var(--pk-duration-base) var(--pk-ease-out);
}

.pk-fade-enter-from,
.pk-fade-leave-to {
  opacity: 0;
}

.pk-drawer-enter-active,
.pk-drawer-leave-active {
  transition: transform var(--pk-duration-slow) var(--pk-ease-out);
}

.pk-drawer-enter-from,
.pk-drawer-leave-to {
  transform: translateX(100%);
}
</style>
