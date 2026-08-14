<script setup lang="ts">
/**
 * Full-width navigation sheet for small screens.
 *
 * Rendered inside the header (not teleported) so it inherits the sticky
 * stacking context, and it locks page scroll while open.
 */

export interface MobileMenuItem {
  route: string
  path: string
  label: string
  icon?: string
}

defineProps<{ items: MobileMenuItem[] }>()

const open = defineModel<boolean>('open', { required: true })

const { t } = useI18n()
const localePath = useLocalePath()

useScrollLock(open)

const close = () => { open.value = false }

// Escape closes the sheet from anywhere inside it.
onKeyStroke('Escape', () => {
  if (open.value) close()
})
</script>

<template>
  <Transition name="pk-sheet">
    <div v-show="open" class="pk-sheet">
      <nav class="pk-sheet__nav" :aria-label="t('nav.menu')">
        <NuxtLink
          v-for="item in items"
          :key="item.route"
          :to="item.path"
          class="pk-sheet__link"
          @click="close"
        >
          <Icon v-if="item.icon" :name="item.icon" aria-hidden="true" />
          <span>{{ item.label }}</span>
          <Icon name="ph:arrow-up-right-bold" class="pk-sheet__arrow" aria-hidden="true" />
        </NuxtLink>
      </nav>

      <div class="pk-sheet__footer">
        <LanguageSwitcher />
        <BaseButton :to="localePath('/produk')" variant="accent" size="sm" @click="close">
          {{ t('common.orderNow') }}
        </BaseButton>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-sheet {
  @include glass(0.97, 22px);

  padding: var(--pk-space-4) var(--pk-gutter) var(--pk-space-6);
  border-block-start: 1px solid var(--pk-border);
  box-shadow: var(--pk-shadow-lg);

  @include up('lg') {
    display: none;
  }
}

.pk-sheet__nav {
  display: flex;
  flex-direction: column;
  gap: var(--pk-space-1);
}

.pk-sheet__link {
  display: flex;
  align-items: center;
  padding: var(--pk-space-4);
  border-radius: var(--pk-radius-md);
  color: var(--pk-plum-800);
  font-family: var(--pk-font-display);
  font-size: rem(20px);
  font-weight: 600;
  gap: var(--pk-space-3);
  transition: background-color var(--pk-duration-fast) var(--pk-ease-out);

  @include focus-ring(-2px);

  &:active {
    background: var(--pk-cream-200);
  }

  @include hover-capable {
    &:hover {
      background: var(--pk-cream-200);
    }
  }
}

.pk-sheet__arrow {
  margin-inline-start: auto;
  color: var(--pk-caramel-600);
  font-size: rem(15px);
}

.pk-sheet__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-block-start: var(--pk-space-5);
  margin-block-start: var(--pk-space-4);
  border-block-start: 1px solid var(--pk-border);
  gap: var(--pk-space-4);
}

// Transition
.pk-sheet-enter-active,
.pk-sheet-leave-active {
  transition:
    opacity var(--pk-duration-base) var(--pk-ease-out),
    transform var(--pk-duration-base) var(--pk-ease-out);
}

.pk-sheet-enter-from,
.pk-sheet-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>
