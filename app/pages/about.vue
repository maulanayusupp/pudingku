<script setup lang="ts">
/**
 * About page.
 *
 * Includes an explicit "what we do not have yet" section. That is intentional
 * and required by the project's content rules — it is the counterweight to
 * every claim made elsewhere on the site. Do not remove it without replacing it
 * with real, documented certification details.
 */

const { t, tm, rt } = useI18n()
const localePath = useLocalePath()

interface Value { title: string, body: string, icon: string }

const VALUE_ICONS = ['ph:notebook-duotone', 'ph:palette-duotone', 'ph:handshake-duotone']

const paragraphs = computed(() =>
  (tm('about.story.paragraphs') as unknown[]).map(entry => rt(entry as never)),
)

const values = computed<Value[]>(() =>
  (tm('about.values.items') as Record<string, unknown>[]).map((item, index) => ({
    title: rt(item.title as never),
    body: rt(item.body as never),
    icon: VALUE_ICONS[index % VALUE_ICONS.length]!,
  })),
)

useSeoPage(() => ({
  title: t('about.meta.title'),
  description: t('about.meta.description'),
}))
</script>

<template>
  <div class="pk-about">
    <header class="pk-about__hero">
      <div class="pk-container--narrow">
        <BreadcrumbTrail
          class="pk-about__crumbs"
          :items="[
            { label: t('nav.home'), to: localePath('/') },
            { label: t('nav.about') },
          ]"
        />

        <p class="pk-about__eyebrow">
          {{ t('about.eyebrow') }}
        </p>

        <h1 class="pk-about__title">
          {{ t('about.title') }}
        </h1>

        <p class="pk-about__lead">
          {{ t('about.lead') }}
        </p>
      </div>
    </header>

    <section class="pk-about__story pk-section">
      <div class="pk-container--narrow">
        <h2 class="pk-about__sectionTitle">
          {{ t('about.story.heading') }}
        </h2>

        <div class="pk-prose">
          <p v-for="(paragraph, index) in paragraphs" :key="index">
            {{ paragraph }}
          </p>
        </div>
      </div>
    </section>

    <section class="pk-about__values pk-section">
      <div class="pk-container">
        <SectionHeading :title="t('about.values.heading')" align="center" />

        <ul v-reveal class="pk-about__valueGrid pk-stagger">
          <li v-for="value in values" :key="value.title" class="pk-about__value">
            <Icon :name="value.icon" class="pk-about__valueIcon" aria-hidden="true" />
            <h3 class="pk-about__valueTitle">
              {{ value.title }}
            </h3>
            <p class="pk-about__valueBody">
              {{ value.body }}
            </p>
          </li>
        </ul>
      </div>
    </section>

    <section class="pk-about__transparency pk-section">
      <div class="pk-container--narrow">
        <div class="pk-about__transparencyPanel">
          <Icon name="ph:seal-question-duotone" class="pk-about__transparencyIcon" aria-hidden="true" />

          <div>
            <h2 class="pk-about__transparencyTitle">
              {{ t('about.transparency.heading') }}
            </h2>
            <p class="pk-about__transparencyBody">
              {{ t('about.transparency.body') }}
            </p>
            <BaseButton
              :to="localePath('/kepatuhan')"
              variant="outline"
              size="sm"
              icon-trailing="ph:arrow-right-bold"
              class="pk-about__transparencyCta"
            >
              {{ t('about.transparency.cta') }}
            </BaseButton>
          </div>
        </div>
      </div>
    </section>

    <CtaBanner
      :title="t('about.contactCta.heading')"
      :description="t('about.contactCta.body')"
      :primary-label="t('about.contactCta.cta')"
      :primary-to="localePath('/kontak')"
      :secondary-label="t('nav.products')"
      :secondary-to="localePath('/produk')"
    />
  </div>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-about__hero {
  padding-block: fluid(28px, 56px) fluid(32px, 64px);
  background:
    radial-gradient(56% 48% at 82% 8%, rgb(240 201 144 / 46%) 0%, transparent 66%),
    radial-gradient(48% 42% at 8% 92%, rgb(194 74 99 / 16%) 0%, transparent 66%),
    var(--pk-cream-100);
}

.pk-about__crumbs {
  margin-block-end: var(--pk-space-5);
}

.pk-about__eyebrow {
  @include eyebrow;

  color: var(--pk-caramel-700);
  margin-block-end: var(--pk-space-3);
}

.pk-about__title {
  @include display(32px, 60px);

  color: var(--pk-plum-800);
}

.pk-about__lead {
  max-width: 54ch;
  color: var(--pk-ink-700);
  font-size: fluid(17px, 21px);
  line-height: var(--pk-leading-relaxed);
  margin-block-start: var(--pk-space-4);
}

.pk-about__sectionTitle {
  @include display(24px, 34px);

  color: var(--pk-plum-800);
  margin-block-end: var(--pk-space-4);
}

.pk-about__values {
  background: var(--pk-cream-50);
  border-block: 1px solid var(--pk-border);
}

.pk-about__valueGrid {
  display: grid;
  gap: var(--pk-space-5);
  margin-block-start: var(--pk-space-7);
  grid-template-columns: 1fr;

  @include up('md') {
    grid-template-columns: repeat(3, 1fr);
  }
}

.pk-about__value {
  display: flex;
  flex-direction: column;
  padding: var(--pk-space-5);
  gap: var(--pk-space-2);

  @include surface(var(--pk-radius-lg), var(--pk-shadow-xs));
}

.pk-about__valueIcon {
  color: var(--pk-caramel-600);
  font-size: rem(30px);
  margin-block-end: var(--pk-space-1);
}

.pk-about__valueTitle {
  font-family: var(--pk-font-display);
  font-size: rem(20px);
  color: var(--pk-plum-800);
}

.pk-about__valueBody {
  color: var(--pk-text-muted);
  font-size: rem(14px);
  line-height: var(--pk-leading-relaxed);
}

.pk-about__transparencyPanel {
  display: flex;
  padding: fluid(20px, 36px);
  border: 1px solid var(--pk-caramel-300);
  background: var(--pk-caramel-100);
  border-radius: var(--pk-radius-xl);
  gap: var(--pk-space-4);
}

.pk-about__transparencyIcon {
  flex-shrink: 0;
  color: var(--pk-caramel-700);
  font-size: rem(36px);
}

.pk-about__transparencyTitle {
  font-family: var(--pk-font-display);
  font-size: fluid(20px, 26px);
  color: var(--pk-plum-800);
  margin-block-end: var(--pk-space-2);
}

.pk-about__transparencyBody {
  color: var(--pk-ink-700);
  font-size: rem(15px);
  line-height: var(--pk-leading-relaxed);
}

.pk-about__transparencyCta {
  margin-block-start: var(--pk-space-4);
}
</style>
