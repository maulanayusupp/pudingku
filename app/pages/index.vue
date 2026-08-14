<script setup lang="ts">
import type { Product } from '#shared/types/catalog'

/**
 * Home page.
 *
 * Fetches the catalog once and derives every section from that single payload,
 * so the page makes two requests (catalog + category summary) rather than one
 * per section.
 */

const { t, tm, rt } = useI18n()
const localePath = useLocalePath()

const { data: catalog, pending } = await useProductRail({ key: 'home-all' })
const { data: summary } = await useCategorySummary()

const puddings = computed<Product[]>(() =>
  (catalog.value?.items ?? []).filter(item => item.category === 'pudding'),
)

const cakes = computed<Product[]>(() =>
  (catalog.value?.items ?? []).filter(item => item.category === 'cake'),
)

/** Three signature items drive the hero composition. */
const heroShowcase = computed<Product[]>(() => {
  const signatures = puddings.value.filter(item => item.badges.includes('signature'))
  const pool = signatures.length >= 3 ? signatures : puddings.value
  return pool.slice(0, 3)
})

const covers = computed<Record<string, Product | undefined>>(() => ({
  pudding: puddings.value[0],
  cake: cakes.value[0],
}))

/** First three FAQ entries are teased on the home page. */
const faqTeasers = computed(() =>
  (tm('faq.items') as Record<string, unknown>[]).slice(0, 3).map(item => ({
    q: rt(item.q as never),
    a: rt(item.a as never),
  })),
)

useSeoPage(() => ({
  title: t('site.tagline'),
  description: t('site.shortDescription'),
  image: '/og/pudingku-og.png',
}))
</script>

<template>
  <div>
    <HeroSection :showcase="heroShowcase" />

    <MarqueeRibbon />

    <SignatureRail :items="puddings" :pending="pending" />

    <CategorySplit :categories="summary?.categories ?? []" :covers="covers" />

    <ProcessSteps />

    <PromiseGrid />

    <section class="pk-homeFaq pk-section">
      <div class="pk-container--narrow">
        <SectionHeading
          :eyebrow="t('home.faqTeaser.eyebrow')"
          :title="t('home.faqTeaser.title')"
          align="center"
        />

        <div v-reveal class="pk-homeFaq__list pk-stagger">
          <AccordionItem
            v-for="(item, index) in faqTeasers"
            :key="item.q"
            :question="item.q"
            :answer="item.a"
            :open="index === 0"
          />
        </div>

        <div class="pk-homeFaq__action">
          <BaseButton :to="localePath('/tanya-jawab')" variant="ghost" icon-trailing="ph:arrow-right-bold">
            {{ t('home.faqTeaser.cta') }}
          </BaseButton>
        </div>
      </div>
    </section>

    <CtaBanner
      :eyebrow="t('home.cta.eyebrow')"
      :title="t('home.cta.title')"
      :description="t('home.cta.description')"
      :primary-label="t('home.cta.primary')"
      :primary-to="localePath('/produk')"
      :secondary-label="t('home.cta.secondary')"
      :secondary-to="localePath('/kontak')"
    />
  </div>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-homeFaq__list {
  display: flex;
  flex-direction: column;
  gap: var(--pk-space-3);
  margin-block-start: var(--pk-space-7);
}

.pk-homeFaq__action {
  display: flex;
  justify-content: center;
  margin-block-start: var(--pk-space-5);
}
</style>
