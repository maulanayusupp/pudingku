<script setup lang="ts">
/**
 * FAQ.
 *
 * Emits `FAQPage` structured data from the same array that renders the
 * accordions, so the rich result and the page can never disagree. Answers live
 * in the DOM even when collapsed, which keeps them indexable.
 */

const { t, tm, rt } = useI18n()
const localePath = useLocalePath()

interface FaqItem { q: string, a: string }

const items = computed<FaqItem[]>(() =>
  (tm('faq.items') as Record<string, unknown>[]).map(item => ({
    q: rt(item.q as never),
    a: rt(item.a as never),
  })),
)

useSeoPage(() => ({
  title: t('faq.meta.title'),
  description: t('faq.meta.description'),
}))

useSchemaOrg([
  defineWebPage({ '@type': 'FAQPage' }),
  ...items.value.map(item => defineQuestion({
    name: item.q,
    acceptedAnswer: item.a,
  })),
])
</script>

<template>
  <div class="pk-faq pk-section">
    <div class="pk-container--narrow">
      <BreadcrumbTrail
        class="pk-faq__crumbs"
        :items="[
          { label: t('nav.home'), to: localePath('/') },
          { label: t('nav.faq') },
        ]"
      />

      <SectionHeading
        :eyebrow="t('faq.eyebrow')"
        :title="t('faq.title')"
        :description="t('faq.description')"
        level="2"
      />

      <div v-reveal class="pk-faq__list pk-stagger">
        <AccordionItem
          v-for="(item, index) in items"
          :key="item.q"
          :question="item.q"
          :answer="item.a"
          :open="index === 0"
        />
      </div>

      <div class="pk-faq__foot">
        <p class="pk-faq__footText">
          {{ t('faq.stillHaveQuestions') }}
        </p>
        <BaseButton :to="localePath('/kontak')" variant="accent" icon-trailing="ph:arrow-right-bold">
          {{ t('faq.contactCta') }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-faq__crumbs {
  margin-block-end: var(--pk-space-5);
}

.pk-faq__list {
  display: flex;
  flex-direction: column;
  gap: var(--pk-space-3);
  margin-block-start: var(--pk-space-7);
}

.pk-faq__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  padding: var(--pk-space-5);
  border: 1px dashed var(--pk-border-strong);
  background: var(--pk-cream-50);
  border-radius: var(--pk-radius-lg);
  gap: var(--pk-space-4);
  margin-block-start: var(--pk-space-7);
}

.pk-faq__footText {
  color: var(--pk-plum-800);
  font-family: var(--pk-font-display);
  font-size: fluid(18px, 22px);
}
</style>
