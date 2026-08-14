#!/usr/bin/env node
/**
 * Generates Open Graph share cards into `public/og/`.
 *
 * Why this exists: product pages previously pointed `og:image` at the product's
 * SVG illustration. WhatsApp, Facebook and Instagram cannot render SVG in a link
 * preview — sharing a product link showed no image at all. Social crawlers need
 * a raster image, at a fixed size, under their size limit.
 *
 * Output (JPEG, 1200×630 — the size every platform crops predictably):
 *   og/pudingku-og.<locale>.jpg          brand card, one per locale
 *   og/products/<slug>.<locale>.jpg      one card per product per locale
 *
 * JPEG rather than PNG because WhatsApp is the strictest consumer here: it
 * skips images much above ~300 KB, and these cards are gradients + one
 * illustration, which JPEG compresses far better than PNG.
 *
 * Product copy is read from `server/data/products.ts` through jiti, so the cards
 * can never drift from the catalog.
 *
 * Run: `npm run art:og`
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import sharp from 'sharp'
import { createJiti } from 'jiti'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = resolve(ROOT, 'public/og')

const jiti = createJiti(import.meta.url, { interopDefault: true })
const { productRecords } = await jiti.import(resolve(ROOT, 'server/data/products.ts'))

const WIDTH = 1200
const HEIGHT = 630

const BRAND = {
  plum: '#4b1b39',
  plumDeep: '#2e0f23',
  plumInk: '#1f0a18',
  caramel: '#d89a52',
  caramelLight: '#f0c990',
  caramelDark: '#a56a26',
  cream: '#fdf6ec',
  creamDim: '#e7d3e0',
}

const SERIF = "Georgia, 'Times New Roman', 'Iowan Old Style', serif"
const SANS = "Helvetica, 'Helvetica Neue', Arial, sans-serif"

const COPY = {
  id: {
    tagline: 'Puding &amp; kue buatan tangan',
    sub: '10 varian puding &#183; 6 kue &#183; dibuat per batch kecil',
    pudding: 'Puding',
    cake: 'Kue',
  },
  en: {
    tagline: 'Hand-made puddings &amp; cakes',
    sub: '10 pudding variants &#183; 6 cakes &#183; made in small batches',
    pudding: 'Pudding',
    cake: 'Cakes',
  },
}

const escapeXml = value =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const formatIdr = (amount, locale) =>
  new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)

/**
 * Greedy word wrap. SVG `<text>` does not wrap, so long product names are split
 * into `<tspan>` lines here. Width is estimated from the character count — a
 * serif averages roughly 0.5em per glyph, which is accurate enough for a card
 * with this much slack.
 */
function wrap(text, fontSize, maxWidth, maxLines = 3) {
  const perChar = fontSize * 0.52
  const maxChars = Math.max(8, Math.floor(maxWidth / perChar))
  const words = text.split(/\s+/)
  const lines = []
  let current = ''

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length <= maxChars) {
      current = candidate
      continue
    }
    if (current) lines.push(current)
    current = word
    if (lines.length === maxLines - 1) break
  }
  if (current && lines.length < maxLines) lines.push(current)

  return lines.length ? lines : [text]
}

const sharedDefs = accent => `
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="${BRAND.plum}"/>
    <stop offset="58%" stop-color="${BRAND.plumDeep}"/>
    <stop offset="100%" stop-color="${BRAND.plumInk}"/>
  </linearGradient>
  <radialGradient id="glow" cx="84%" cy="18%" r="66%">
    <stop offset="0%" stop-color="${accent}" stop-opacity="0.62"/>
    <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="dome" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="${BRAND.caramelLight}"/>
    <stop offset="58%" stop-color="${BRAND.caramel}"/>
    <stop offset="100%" stop-color="${BRAND.caramelDark}"/>
  </linearGradient>
  <linearGradient id="drip" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#fae6cd"/>
    <stop offset="100%" stop-color="#e6b477"/>
  </linearGradient>
`

/** Small Pudingku lockup used in the corner of every card. */
const lockup = (x, y, scale = 1) => `
  <g transform="translate(${x} ${y}) scale(${scale})">
    <g transform="scale(0.72)">
      <circle cx="32" cy="32" r="32" fill="${BRAND.caramel}" opacity="0.16"/>
      <path d="M14 45c0-11.6 8-22 18-22s18 10.4 18 22z" fill="url(#dome)"/>
      <ellipse cx="32" cy="45" rx="18" ry="4.4" fill="${BRAND.caramelDark}"/>
      <path d="M18.6 34.5c2.6-4.8 7.6-8.6 13.4-8.6s10.8 3.8 13.4 8.6c-1.6 1.5-3.1.3-4.3 1.9-1.2 1.6-2.5 3.3-4.2 2.1-1.7-1.2-2-3.2-3.6-3.2s-2.3 2.4-4 3.4c-1.7 1-3-.9-4.2-2.3-1.2-1.4-2.9-.4-4.5-1.9z" fill="url(#drip)"/>
    </g>
    <text x="60" y="34" font-family="${SERIF}" font-size="34" font-weight="700" fill="${BRAND.cream}">Pudingku</text>
  </g>
`

// ── Brand card ───────────────────────────────────────────────────────────────

function brandCard(locale) {
  const copy = COPY[locale]

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>${sharedDefs(BRAND.caramel)}</defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>

  <g transform="translate(742 148) scale(5.4)">
    <path d="M14 45c0-11.6 8-22 18-22s18 10.4 18 22z" fill="url(#dome)"/>
    <ellipse cx="32" cy="45" rx="18" ry="4.4" fill="${BRAND.caramelDark}"/>
    <path d="M18.6 34.5c2.6-4.8 7.6-8.6 13.4-8.6s10.8 3.8 13.4 8.6c-1.6 1.5-3.1.3-4.3 1.9-1.2 1.6-2.5 3.3-4.2 2.1-1.7-1.2-2-3.2-3.6-3.2s-2.3 2.4-4 3.4c-1.7 1-3-.9-4.2-2.3-1.2-1.4-2.9-.4-4.5-1.9z" fill="url(#drip)"/>
    <ellipse cx="26" cy="31" rx="4.2" ry="2.6" fill="#ffffff" opacity="0.5" transform="rotate(-24 26 31)"/>
  </g>

  <text x="86" y="252" font-family="${SERIF}" font-size="104" font-weight="700" fill="${BRAND.cream}">Pudingku</text>
  <text x="90" y="320" font-family="${SANS}" font-size="30" font-weight="600" fill="${BRAND.caramelLight}">${copy.tagline}</text>
  <text x="90" y="370" font-family="${SANS}" font-size="26" fill="${BRAND.creamDim}">${copy.sub}</text>
  <rect x="90" y="432" width="128" height="6" rx="3" fill="${BRAND.caramel}"/>
</svg>`
}

// ── Product card ─────────────────────────────────────────────────────────────

function productCard(record, locale, artPngBase64) {
  const name = escapeXml(record.name[locale])
  const category = COPY[locale][record.category]
  const price = escapeXml(formatIdr(record.priceIdr, locale))
  const unit = escapeXml(record.unit[locale])

  const nameSize = name.length > 26 ? 62 : 76
  const lines = wrap(name, nameSize, 560, 3)
  const startY = 300 - (lines.length - 1) * (nameSize * 0.56)

  const nameTspans = lines
    .map((line, index) =>
      `<tspan x="86" dy="${index === 0 ? 0 : nameSize * 1.12}">${escapeXml(line)}</tspan>`)
    .join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    ${sharedDefs(record.accentSoft)}
    <clipPath id="art">
      <circle cx="930" cy="315" r="238"/>
    </clipPath>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#glow)"/>

  <!-- Product illustration, pre-rasterised and clipped to a circle -->
  <circle cx="930" cy="315" r="256" fill="${record.accentSoft}" opacity="0.24"/>
  <image href="data:image/png;base64,${artPngBase64}" x="692" y="77" width="476" height="476" clip-path="url(#art)" preserveAspectRatio="xMidYMid slice"/>
  <circle cx="930" cy="315" r="238" fill="none" stroke="${BRAND.caramelLight}" stroke-opacity="0.42" stroke-width="3"/>

  ${lockup(86, 78, 1)}

  <text x="86" y="196" font-family="${SANS}" font-size="22" font-weight="700" letter-spacing="4" fill="${BRAND.caramelLight}">${escapeXml(category.toUpperCase())}</text>

  <text y="${startY}" font-family="${SERIF}" font-size="${nameSize}" font-weight="700" fill="${BRAND.cream}">${nameTspans}</text>

  <rect x="86" y="452" width="96" height="5" rx="3" fill="${BRAND.caramel}"/>

  <text x="86" y="530" font-family="${SANS}" font-size="46" font-weight="700" fill="${BRAND.caramelLight}">${price}</text>
  <text x="86" y="568" font-family="${SANS}" font-size="24" fill="${BRAND.creamDim}">${unit}</text>
</svg>`
}

// ── Run ──────────────────────────────────────────────────────────────────────

const toJpeg = svg =>
  sharp(Buffer.from(svg))
    .jpeg({ quality: 86, progressive: true, chromaSubsampling: '4:4:4' })
    .toBuffer()

async function main() {
  await mkdir(resolve(OUT, 'products'), { recursive: true })

  const locales = ['id', 'en']
  let largest = 0

  for (const locale of locales) {
    const buffer = await toJpeg(brandCard(locale))
    largest = Math.max(largest, buffer.length)
    await writeFile(resolve(OUT, `pudingku-og.${locale}.jpg`), buffer)
  }

  for (const record of productRecords) {
    // Rasterise the product SVG once, then embed it in both locale cards.
    const artPath = resolve(ROOT, 'public', record.image.replace(/^\//, ''))
    const art = await sharp(artPath).resize(476, 476).png().toBuffer()
    const base64 = art.toString('base64')

    for (const locale of locales) {
      const buffer = await toJpeg(productCard(record, locale, base64))
      largest = Math.max(largest, buffer.length)
      await writeFile(resolve(OUT, `products/${record.slug}.${locale}.jpg`), buffer)
    }
  }

  const count = locales.length * (productRecords.length + 1)
  console.log(`Generated ${count} Open Graph cards in public/og/`)
  console.log(`Largest card: ${Math.round(largest / 1024)} KB`)

  // WhatsApp quietly drops images much above ~300 KB, which would show a link
  // preview with no picture. Fail loudly rather than shipping that.
  if (largest > 300 * 1024) {
    console.error(`\nERROR: a card exceeds the 300 KB WhatsApp budget. Lower the JPEG quality.`)
    process.exitCode = 1
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
