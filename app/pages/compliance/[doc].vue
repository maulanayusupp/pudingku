<script setup lang="ts">
import { COMPLIANCE_DOCS, COMPLIANCE_DOC_ICONS } from '~/constants/navigation'
import { formatDate } from '~/utils/format'
import type { ComplianceDoc } from '~/constants/navigation'

/**
 * A single compliance document.
 *
 * All six documents share this template and read their content from
 * `compliance.docs.<doc>.sections` in the locale files. Adding a seventh policy
 * means adding a key to `COMPLIANCE_DOCS` and the same section array to BOTH
 * locale files — no new page component.
 *
 * Sections are read from the raw locale message object rather than through
 * `tm()`/`rt()` because they are static prose with no interpolation, and the raw
 * object keeps the nested `p` / `ul` arrays as plain strings.
 */

const route = useRoute()
const { t, locale, getLocaleMessage } = useI18n()
const localePath = useLocalePath()

const doc = computed(() => String(route.params.doc) as ComplianceDoc)

if (!COMPLIANCE_DOCS.includes(doc.value)) {
  throw createError({ statusCode: 404, statusMessage: 'Policy not found', fatal: true })
}

interface Section {
  h: string
  p?: string[]
  ul?: string[]
}

interface ComplianceMessages {
  compliance?: {
    docs?: Record<string, { title: string, summary: string, sections: Section[] }>
  }
}

const document_ = computed(() => {
  const messages = getLocaleMessage(locale.value) as ComplianceMessages
  return messages.compliance?.docs?.[doc.value]
})

const sections = computed<Section[]>(() => document_.value?.sections ?? [])

const updatedAt = computed(() => formatDate(t('compliance.updatedAt'), locale.value))

/** Sibling documents, so a reader can move between policies without going back. */
const siblings = computed(() =>
  COMPLIANCE_DOCS.filter(key => key !== doc.value).map(key => ({
    key,
    title: t(`compliance.docs.${key}.title`),
    icon: COMPLIANCE_DOC_ICONS[key],
    path: localePath(`/kepatuhan/${key}`),
  })),
)

useSeoPage(() => ({
  title: t(`compliance.docs.${doc.value}.title`),
  description: t(`compliance.docs.${doc.value}.summary`),
  type: 'article',
}))
</script>

<template>
  <div class="pk-policy pk-section">
    <div class="pk-container">
      <BreadcrumbTrail
        class="pk-policy__crumbs"
        :items="[
          { label: t('nav.home'), to: localePath('/') },
          { label: t('nav.compliance'), to: localePath('/kepatuhan') },
          { label: t(`compliance.docs.${doc}.title`) },
        ]"
      />

      <div class="pk-policy__layout">
        <article class="pk-policy__article">
          <header class="pk-policy__header">
            <Icon :name="COMPLIANCE_DOC_ICONS[doc]" class="pk-policy__icon" aria-hidden="true" />

            <h1 class="pk-policy__title">
              {{ t(`compliance.docs.${doc}.title`) }}
            </h1>

            <p class="pk-policy__summary">
              {{ t(`compliance.docs.${doc}.summary`) }}
            </p>

            <p class="pk-policy__updated">
              {{ t('compliance.lastUpdated') }}:
              <time :datetime="t('compliance.updatedAt')">{{ updatedAt }}</time>
            </p>
          </header>

          <div class="pk-prose pk-policy__body">
            <section v-for="section in sections" :key="section.h">
              <h2>{{ section.h }}</h2>

              <p v-for="(paragraph, index) in section.p ?? []" :key="`p-${index}`">
                {{ paragraph }}
              </p>

              <ul v-if="section.ul?.length">
                <li v-for="(entry, index) in section.ul" :key="`li-${index}`">
                  {{ entry }}
                </li>
              </ul>
            </section>
          </div>

          <footer class="pk-policy__footer">
            <BaseButton
              :to="localePath('/kepatuhan')"
              variant="outline"
              size="sm"
              icon="ph:arrow-left-bold"
            >
              {{ t('compliance.backToCompliance') }}
            </BaseButton>

            <BaseButton
              :to="localePath('/kontak')"
              variant="ghost"
              size="sm"
              icon-trailing="ph:arrow-right-bold"
            >
              {{ t('nav.contact') }}
            </BaseButton>
          </footer>
        </article>

        <aside class="pk-policy__aside">
          <h2 class="pk-policy__asideTitle">
            {{ t('footer.legal') }}
          </h2>

          <ul class="pk-policy__siblings">
            <li v-for="sibling in siblings" :key="sibling.key">
              <NuxtLink :to="sibling.path" class="pk-policy__sibling">
                <Icon :name="sibling.icon" aria-hidden="true" />
                {{ sibling.title }}
              </NuxtLink>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-policy__crumbs {
  margin-block-end: var(--pk-space-5);
}

.pk-policy__layout {
  display: grid;
  gap: fluid(24px, 56px);
  grid-template-columns: 1fr;
  align-items: start;

  @include up('lg') {
    grid-template-columns: minmax(0, 1fr) 16rem;
  }
}

.pk-policy__article {
  min-width: 0;
}

.pk-policy__header {
  padding-block-end: var(--pk-space-5);
  border-block-end: 1px solid var(--pk-border);
}

.pk-policy__icon {
  color: var(--pk-caramel-600);
  font-size: rem(34px);
  margin-block-end: var(--pk-space-3);
}

.pk-policy__title {
  @include display(28px, 46px);

  color: var(--pk-plum-800);
}

.pk-policy__summary {
  max-width: 56ch;
  color: var(--pk-text-muted);
  font-size: fluid(15px, 18px);
  line-height: var(--pk-leading-relaxed);
  margin-block-start: var(--pk-space-3);
}

.pk-policy__updated {
  color: var(--pk-text-subtle);
  font-size: rem(12.5px);
  margin-block-start: var(--pk-space-4);
}

.pk-policy__body {
  margin-block-start: var(--pk-space-6);

  section + section {
    margin-block-start: var(--pk-space-7);
  }
}

.pk-policy__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  padding-block-start: var(--pk-space-5);
  border-block-start: 1px solid var(--pk-border);
  gap: var(--pk-space-3);
  margin-block-start: var(--pk-space-8);
}

// ── Aside ────────────────────────────────────────────────────────────────────

.pk-policy__aside {
  padding: var(--pk-space-5);

  @include surface(var(--pk-radius-lg), var(--pk-shadow-xs));

  @include up('lg') {
    position: sticky;
    inset-block-start: calc(var(--pk-header-height) + var(--pk-space-5));
  }
}

.pk-policy__asideTitle {
  @include eyebrow;

  color: var(--pk-caramel-700);
  margin-block-end: var(--pk-space-4);
}

.pk-policy__siblings {
  display: flex;
  flex-direction: column;
  gap: var(--pk-space-1);
}

.pk-policy__sibling {
  display: flex;
  align-items: center;
  padding: var(--pk-space-2) var(--pk-space-3);
  border-radius: var(--pk-radius-sm);
  color: var(--pk-ink-700);
  font-size: rem(14px);
  font-weight: 600;
  gap: 0.5em;
  transition:
    background-color var(--pk-duration-fast) var(--pk-ease-out),
    color var(--pk-duration-fast) var(--pk-ease-out);

  @include focus-ring(-2px);

  > svg {
    color: var(--pk-plum-500);
    font-size: 1.15em;
  }

  @include hover-capable {
    &:hover {
      background: var(--pk-cream-200);
      color: var(--pk-plum-700);
    }
  }
}
</style>
