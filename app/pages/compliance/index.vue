<script setup lang="ts">
import { COMPLIANCE_DOCS, COMPLIANCE_DOC_ICONS } from '~/constants/navigation'
import { formatDate } from '~/utils/format'

/**
 * Compliance hub.
 *
 * Lists every policy document and — importantly — states plainly what this
 * build of the site can and cannot do (`compliance.statusBody`). Keep that
 * status block in sync with reality whenever a real payment gateway, order
 * store or mail provider is connected. See CLAUDE.md → "Aturan kepatuhan".
 */

const { t, locale } = useI18n()
const localePath = useLocalePath()

const updatedAt = computed(() => formatDate(t('compliance.updatedAt'), locale.value))

const docs = computed(() =>
  COMPLIANCE_DOCS.map(doc => ({
    key: doc,
    title: t(`compliance.docs.${doc}.title`),
    summary: t(`compliance.docs.${doc}.summary`),
    icon: COMPLIANCE_DOC_ICONS[doc],
    path: localePath(`/kepatuhan/${doc}`),
  })),
)

useSeoPage(() => ({
  title: t('compliance.meta.title'),
  description: t('compliance.meta.description'),
}))
</script>

<template>
  <div class="pk-compliance pk-section">
    <div class="pk-container">
      <BreadcrumbTrail
        class="pk-compliance__crumbs"
        :items="[
          { label: t('nav.home'), to: localePath('/') },
          { label: t('nav.compliance') },
        ]"
      />

      <SectionHeading
        :eyebrow="t('compliance.eyebrow')"
        :title="t('compliance.title')"
        :description="t('compliance.description')"
        :level="2"
      />

      <p class="pk-compliance__updated">
        {{ t('compliance.lastUpdated') }}: <time :datetime="t('compliance.updatedAt')">{{ updatedAt }}</time>
      </p>

      <BaseNotice tone="info" class="pk-compliance__status" :title="t('compliance.statusTitle')">
        {{ t('compliance.statusBody') }}
      </BaseNotice>

      <ul v-reveal class="pk-compliance__grid pk-stagger">
        <li v-for="doc in docs" :key="doc.key">
          <NuxtLink :to="doc.path" class="pk-compliance__card">
            <Icon :name="doc.icon" class="pk-compliance__icon" aria-hidden="true" />

            <h2 class="pk-compliance__cardTitle">
              {{ doc.title }}
            </h2>
            <p class="pk-compliance__cardSummary">
              {{ doc.summary }}
            </p>

            <span class="pk-compliance__cardCta">
              {{ t('compliance.readDocument') }}
              <Icon name="ph:arrow-right-bold" aria-hidden="true" />
            </span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-compliance__crumbs {
  margin-block-end: var(--pk-space-5);
}

.pk-compliance__updated {
  color: var(--pk-text-muted);
  font-size: rem(13px);
  margin-block-start: var(--pk-space-4);
}

.pk-compliance__status {
  margin-block-start: var(--pk-space-5);
}

.pk-compliance__grid {
  display: grid;
  gap: var(--pk-space-4);
  margin-block-start: var(--pk-space-7);
  grid-template-columns: 1fr;

  @include up('sm') {
    grid-template-columns: repeat(2, 1fr);
  }

  @include up('lg') {
    grid-template-columns: repeat(3, 1fr);
  }
}

.pk-compliance__card {
  display: flex;
  height: 100%;
  flex-direction: column;
  padding: var(--pk-space-5);
  gap: var(--pk-space-2);
  transition:
    transform var(--pk-duration-base) var(--pk-ease-jelly),
    border-color var(--pk-duration-base) var(--pk-ease-out),
    box-shadow var(--pk-duration-base) var(--pk-ease-out);

  @include surface(var(--pk-radius-lg), var(--pk-shadow-xs));
  @include focus-ring(3px);

  @include hover-capable {
    &:hover {
      border-color: var(--pk-caramel-400);
      box-shadow: var(--pk-shadow-md);
      transform: translateY(-4px);
    }

    &:hover .pk-compliance__cardCta > svg {
      transform: translateX(4px);
    }
  }
}

.pk-compliance__icon {
  color: var(--pk-plum-600);
  font-size: rem(28px);
  margin-block-end: var(--pk-space-1);
}

.pk-compliance__cardTitle {
  font-family: var(--pk-font-display);
  font-size: rem(20px);
  color: var(--pk-plum-800);
}

.pk-compliance__cardSummary {
  flex: 1;
  color: var(--pk-text-muted);
  font-size: rem(14px);
  line-height: var(--pk-leading-normal);
}

.pk-compliance__cardCta {
  display: inline-flex;
  align-items: center;
  color: var(--pk-caramel-700);
  font-size: rem(13px);
  font-weight: 800;
  gap: 0.4em;
  margin-block-start: var(--pk-space-3);

  > svg {
    transition: transform var(--pk-duration-base) var(--pk-ease-out);
  }
}
</style>
