<script setup lang="ts">
/**
 * Product artwork.
 *
 * Renders a plain `<img>` rather than `<NuxtImg>` on purpose: every product
 * illustration is an SVG, so there is nothing for an image pipeline to do.
 * Running them through IPX rasterised each one into several PNG variants —
 * larger output, slower builds, and *worse* quality, since a vector rendered at
 * a fixed width stops being crisp on a high-DPI screen.
 *
 * `@nuxt/image` stays in the project for raster assets (the OG card, and any
 * future photography), where the transformation pipeline does earn its place.
 *
 * `width`/`height` are always emitted so the browser reserves the right box and
 * the layout never shifts as art loads.
 */

interface Props {
  src: string
  /** Empty string marks the image as decorative; pair with `aria-hidden`. */
  alt: string
  loading?: 'lazy' | 'eager'
  /** Adds `<link rel=preload>` for the LCP image. */
  preload?: boolean
  size?: number
}

const props = withDefaults(defineProps<Props>(), {
  loading: 'lazy',
  size: 1000,
})

if (props.preload) {
  useHead({
    link: [{ rel: 'preload', as: 'image', href: props.src, fetchpriority: 'high' }],
  })
}
</script>

<template>
  <img
    :src="src"
    :alt="alt"
    :width="size"
    :height="size"
    :loading="loading"
    :fetchpriority="preload ? 'high' : undefined"
    decoding="async"
    draggable="false"
  >
</template>
