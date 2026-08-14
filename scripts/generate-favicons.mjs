#!/usr/bin/env node
/**
 * Generates the full icon set from a single source mark.
 *
 * Outputs into `public/`:
 *   favicon.svg              vector favicon (modern browsers)
 *   favicon.ico              16 + 32 + 48 px (legacy + Windows taskbar)
 *   apple-touch-icon.png     180 px, opaque, no transparency
 *   icon-192.png             PWA / Android
 *   icon-512.png             PWA splash
 *   icon-maskable-512.png    Android adaptive icon, art inset to the safe zone
 *   brand/logo-mark.svg      logo referenced by schema.org
 *   og/pudingku-og.png       1200×630 social card
 *
 * The geometry matches `app/components/layout/BrandMark.vue`, so the tab icon
 * and the header logo are visibly the same mark.
 *
 * Run: `npm run art:favicon`
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'
import pngToIco from 'png-to-ico'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = resolve(ROOT, 'public')

const BRAND = {
  plum: '#4b1b39',
  plumDeep: '#2e0f23',
  caramel: '#d89a52',
  caramelLight: '#f0c990',
  caramelDark: '#a56a26',
  cream: '#fdf6ec',
  creamSoft: '#fae6cd',
}

/**
 * The mark on a 64×64 grid.
 * @param {object} options
 * @param {boolean} options.roundel  draw the plum circle behind the pudding
 * @param {number}  options.padding  inset in grid units (for maskable icons)
 */
function markSvg({ roundel = true, padding = 0 } = {}) {
  const scale = (64 - padding * 2) / 64
  const inner = `
    ${roundel ? `<circle cx="32" cy="32" r="32" fill="url(#roundel)"/>` : ''}
    <path d="M14 45c0-11.6 8-22 18-22s18 10.4 18 22z" fill="url(#dome)"/>
    <ellipse cx="32" cy="45" rx="18" ry="4.4" fill="${BRAND.caramelDark}"/>
    <path d="M18.6 34.5c2.6-4.8 7.6-8.6 13.4-8.6s10.8 3.8 13.4 8.6c-1.6 1.5-3.1.3-4.3 1.9-1.2 1.6-2.5 3.3-4.2 2.1-1.7-1.2-2-3.2-3.6-3.2s-2.3 2.4-4 3.4c-1.7 1-3-.9-4.2-2.3-1.2-1.4-2.9-.4-4.5-1.9z" fill="url(#drip)"/>
    <ellipse cx="26" cy="31" rx="4.2" ry="2.6" fill="#ffffff" opacity="0.5" transform="rotate(-24 26 31)"/>
  `

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64" role="img" aria-label="Pudingku">
  <defs>
    <linearGradient id="roundel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${BRAND.plum}"/>
      <stop offset="100%" stop-color="${BRAND.plumDeep}"/>
    </linearGradient>
    <linearGradient id="dome" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${BRAND.caramelLight}"/>
      <stop offset="58%" stop-color="${BRAND.caramel}"/>
      <stop offset="100%" stop-color="${BRAND.caramelDark}"/>
    </linearGradient>
    <linearGradient id="drip" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${BRAND.creamSoft}"/>
      <stop offset="100%" stop-color="#e6b477"/>
    </linearGradient>
  </defs>
  <g transform="translate(${padding} ${padding}) scale(${scale})">${inner}</g>
</svg>`
}

/** 1200×630 social card: the mark, the wordmark and the tagline. */
function ogSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${BRAND.plum}"/>
      <stop offset="62%" stop-color="${BRAND.plumDeep}"/>
      <stop offset="100%" stop-color="#1f0a18"/>
    </linearGradient>
    <radialGradient id="glow" cx="82%" cy="16%" r="62%">
      <stop offset="0%" stop-color="${BRAND.caramel}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${BRAND.caramel}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="dome" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${BRAND.caramelLight}"/>
      <stop offset="58%" stop-color="${BRAND.caramel}"/>
      <stop offset="100%" stop-color="${BRAND.caramelDark}"/>
    </linearGradient>
    <linearGradient id="drip" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${BRAND.creamSoft}"/>
      <stop offset="100%" stop-color="#e6b477"/>
    </linearGradient>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <!-- Mark, scaled up from the 64-unit grid -->
  <g transform="translate(760 150) scale(5.2)">
    <path d="M14 45c0-11.6 8-22 18-22s18 10.4 18 22z" fill="url(#dome)"/>
    <ellipse cx="32" cy="45" rx="18" ry="4.4" fill="${BRAND.caramelDark}"/>
    <path d="M18.6 34.5c2.6-4.8 7.6-8.6 13.4-8.6s10.8 3.8 13.4 8.6c-1.6 1.5-3.1.3-4.3 1.9-1.2 1.6-2.5 3.3-4.2 2.1-1.7-1.2-2-3.2-3.6-3.2s-2.3 2.4-4 3.4c-1.7 1-3-.9-4.2-2.3-1.2-1.4-2.9-.4-4.5-1.9z" fill="url(#drip)"/>
    <ellipse cx="26" cy="31" rx="4.2" ry="2.6" fill="#ffffff" opacity="0.5" transform="rotate(-24 26 31)"/>
  </g>

  <text x="86" y="250" font-family="Georgia, 'Times New Roman', serif" font-size="104" font-weight="700" fill="${BRAND.cream}">Pudingku</text>
  <text x="90" y="318" font-family="Helvetica, Arial, sans-serif" font-size="30" font-weight="600" letter-spacing="1" fill="${BRAND.caramelLight}">Puding &amp; kue buatan tangan</text>
  <text x="90" y="368" font-family="Helvetica, Arial, sans-serif" font-size="26" fill="#e7d3e0">10 varian puding &#183; 6 kue &#183; dibuat per batch kecil</text>

  <rect x="90" y="430" width="128" height="6" rx="3" fill="${BRAND.caramel}"/>
</svg>`
}

const png = (svg, size, background) => {
  const pipeline = sharp(Buffer.from(svg)).resize(size, size)
  return (background ? pipeline.flatten({ background }) : pipeline).png().toBuffer()
}

async function main() {
  await mkdir(resolve(PUBLIC, 'brand'), { recursive: true })
  await mkdir(resolve(PUBLIC, 'og'), { recursive: true })

  const mark = markSvg()
  // Android masks adaptive icons to a circle/squircle; art must stay inside the
  // central 80%, so the maskable variant gets a 12.5% inset on every side.
  const maskable = markSvg({ padding: 8 })

  await writeFile(resolve(PUBLIC, 'favicon.svg'), `${mark}\n`, 'utf8')
  await writeFile(resolve(PUBLIC, 'brand/logo-mark.svg'), `${mark}\n`, 'utf8')

  // Apple touch icons must not be transparent — iOS composites them on black.
  await writeFile(resolve(PUBLIC, 'apple-touch-icon.png'), await png(mark, 180, BRAND.plum))
  await writeFile(resolve(PUBLIC, 'icon-192.png'), await png(mark, 192))
  await writeFile(resolve(PUBLIC, 'icon-512.png'), await png(mark, 512))
  await writeFile(resolve(PUBLIC, 'icon-maskable-512.png'), await png(maskable, 512, BRAND.plum))

  const ico = await pngToIco([
    await png(mark, 16),
    await png(mark, 32),
    await png(mark, 48),
  ])
  await writeFile(resolve(PUBLIC, 'favicon.ico'), ico)

  const og = await sharp(Buffer.from(ogSvg())).png().toBuffer()
  await writeFile(resolve(PUBLIC, 'og/pudingku-og.png'), og)

  const manifest = {
    name: 'Pudingku',
    short_name: 'Pudingku',
    description: 'Puding dan kue buatan tangan, dibuat per batch kecil.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: BRAND.cream,
    theme_color: BRAND.plum,
    lang: 'id',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
  await writeFile(resolve(PUBLIC, 'site.webmanifest'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

  console.log('Generated favicon set, PWA manifest and OG image in public/')
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
