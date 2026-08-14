<script setup lang="ts">
/**
 * Scrolling ribbon of factual statements about how we work.
 *
 * The list is duplicated once and the track is translated by exactly −50%, which
 * is what makes the loop seamless. The duplicate copy is `aria-hidden` so the
 * claims are announced once, not twice. The whole thing stops moving under
 * `prefers-reduced-motion` and turns into a static, wrapping list.
 */

const { tm, rt } = useI18n()

const items = computed(() =>
  (tm('home.marquee.items') as unknown[]).map(entry => rt(entry as never)),
)
</script>

<template>
  <div class="pk-marquee">
    <div class="pk-marquee__track">
      <ul class="pk-marquee__group">
        <li v-for="item in items" :key="item" class="pk-marquee__item">
          <Icon name="ph:asterisk-simple-bold" aria-hidden="true" />
          {{ item }}
        </li>
      </ul>

      <ul class="pk-marquee__group" aria-hidden="true">
        <li v-for="item in items" :key="`dup-${item}`" class="pk-marquee__item">
          <Icon name="ph:asterisk-simple-bold" aria-hidden="true" />
          {{ item }}
        </li>
      </ul>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'abstracts' as *;

.pk-marquee {
  overflow: hidden;
  padding-block: var(--pk-space-4);
  border-block: 1px solid var(--pk-border);
  background: var(--pk-plum-800);
  color: var(--pk-cream-100);
}

.pk-marquee__track {
  display: flex;
  width: max-content;

  @include motion-safe {
    animation: pk-marquee 34s linear infinite;
  }

  @include reduced-motion {
    flex-wrap: wrap;
    width: 100%;
    justify-content: center;
  }
}

.pk-marquee__group {
  display: flex;
  align-items: center;
  gap: var(--pk-space-7);
  padding-inline-end: var(--pk-space-7);

  @include reduced-motion {
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--pk-space-4);

    // The duplicate exists only to make the animation loop.
    &[aria-hidden='true'] {
      display: none;
    }
  }
}

.pk-marquee__item {
  display: flex;
  align-items: center;
  font-size: rem(13px);
  font-weight: 700;
  gap: 0.5em;
  letter-spacing: var(--pk-tracking-wide);
  text-transform: uppercase;
  white-space: nowrap;

  > svg {
    color: var(--pk-caramel-400);
    font-size: 0.85em;
  }
}

@include hover-capable {
  .pk-marquee:hover .pk-marquee__track {
    animation-play-state: paused;
  }
}
</style>
