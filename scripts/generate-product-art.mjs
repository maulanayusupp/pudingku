#!/usr/bin/env node
/**
 * Generates one bespoke SVG illustration per product into
 * `public/images/products/`.
 *
 * Why generated vector art instead of stock photography:
 *  - Every item gets a genuinely distinct image that matches ITS description
 *    (layer count, colours, garnish), rather than a generic dessert photo of
 *    something we do not actually sell.
 *  - No licensing ambiguity and no external image host.
 *  - ~6 KB per file, resolution-independent, and it inherits the brand palette.
 *
 * Run: `npm run art:products`
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  blob,
  darken,
  document_,
  el,
  lighten,
  linearGradient,
  radialGradient,
  round,
} from './lib/art-primitives.mjs'
import {
  brownieStack,
  flanVessel,
  glassVessel,
  renderGarnish,
  roundCake,
  slabCake,
  tubeCake,
} from './lib/art-vessels.mjs'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = resolve(ROOT, 'public/images/products')

/**
 * One entry per product. `slug` MUST match `server/data/products.ts`.
 * Layers are listed bottom-first.
 */
const SPECS = [
  // ── Puddings ───────────────────────────────────────────────────────────────
  {
    slug: 'lava-cokelat-belgia',
    title: 'Lava Cokelat Belgia',
    description: 'Ilustrasi puding cokelat pekat dalam cup kaca dengan inti ganache dan serpihan kakao.',
    seed: 1011,
    backdrop: ['#f3e3d2', '#e0bd9b'],
    blobs: ['#8c5a33', '#4e2a1e'],
    vessel: { kind: 'glass', style: 'cup' },
    layers: [
      { color: '#2f1a12', weight: 1.1 },
      { color: '#4e2a1e', weight: 1.6 },
      { color: '#6b3c25', weight: 1 },
    ],
    garnish: [
      { type: 'shard', colors: ['#2a1710', '#3f2317', '#5a3320'], count: 7 },
      { type: 'salt', colors: ['#ffffff'], count: 9 },
    ],
  },
  {
    slug: 'mangga-harum-manis',
    title: 'Mangga Harum Manis',
    description: 'Ilustrasi puding mangga dua lapis dengan lapisan santan dan dadu mangga segar di atasnya.',
    seed: 2022,
    backdrop: ['#fff3dd', '#f7d79a'],
    blobs: ['#e2a13a', '#f2c26b'],
    vessel: { kind: 'glass', style: 'cup' },
    layers: [
      { color: '#f6efe2', weight: 1.2 },
      { color: '#f0c069', weight: 0.9 },
      { color: '#e59a24', weight: 1.6 },
    ],
    garnish: [
      { type: 'dice', colors: ['#f5a623', '#f7bf52', '#e08718'], count: 9 },
      { type: 'curl', colors: ['#fbf1e0', '#eddfc6'], count: 5 },
    ],
  },
  {
    slug: 'pandan-kelapa-muda',
    title: 'Pandan Kelapa Muda',
    description: 'Ilustrasi puding pandan hijau muda dengan serutan kelapa muda dan lapisan santan.',
    seed: 3033,
    backdrop: ['#f0f6e6', '#cfe3b7'],
    blobs: ['#6ea25c', '#a7cc86'],
    vessel: { kind: 'glass', style: 'cup' },
    layers: [
      { color: '#5c8f4c', weight: 1.7 },
      { color: '#8fbb72', weight: 0.8 },
      { color: '#f4f1e4', weight: 0.9 },
    ],
    garnish: [
      { type: 'curl', colors: ['#ffffff', '#f3ece0'], count: 8 },
      { type: 'petal', colors: ['#7fa57c', '#96b98d'], count: 3 },
    ],
  },
  {
    slug: 'tiramisu-kopi-gayo',
    title: 'Tiramisu Kopi Gayo',
    description: 'Ilustrasi puding tiramisu berlapis kopi dan mascarpone dengan taburan kakao.',
    seed: 4044,
    backdrop: ['#f6ece0', '#dcc3a4'],
    blobs: ['#6b4326', '#c19a6f'],
    vessel: { kind: 'glass', style: 'cup' },
    layers: [
      { color: '#4a2f1c', weight: 1 },
      { color: '#f0e2cd', weight: 0.9 },
      { color: '#63401f', weight: 0.9 },
      { color: '#f5e9d8', weight: 1.1 },
    ],
    garnish: [
      { type: 'dust', colors: ['#4a2f1c', '#63401f', '#7a5330'], count: 46 },
      { type: 'bean', colors: ['#3b2317', '#54321f'], count: 4 },
    ],
  },
  {
    slug: 'stroberi-mawar',
    title: 'Stroberi Mawar',
    description: 'Ilustrasi puding stroberi merah muda dengan kelopak mawar kering di atasnya.',
    seed: 5055,
    backdrop: ['#fdeef1', '#f6c3ce'],
    blobs: ['#c2405f', '#f095ab'],
    vessel: { kind: 'glass', style: 'coupe' },
    layers: [
      { color: '#f7e6e8', weight: 0.9 },
      { color: '#eea9b9', weight: 1.1 },
      { color: '#d8637f', weight: 1.4 },
    ],
    garnish: [
      { type: 'petal', colors: ['#c94f6b', '#e07c93', '#f0aab8'], count: 7 },
      { type: 'berry', colors: ['#bf2f4c', '#d94663'], count: 3 },
    ],
  },
  {
    slug: 'matcha-azuki',
    title: 'Matcha Azuki',
    description: 'Ilustrasi puding matcha hijau dengan lapisan kacang merah azuki di dasar cup.',
    seed: 6066,
    backdrop: ['#eef3e3', '#c8dbaa'],
    blobs: ['#4f7a3a', '#8f2f42'],
    vessel: { kind: 'glass', style: 'cup' },
    layers: [
      { color: '#7c2b3a', weight: 0.9 },
      { color: '#6f9a4c', weight: 0.5 },
      { color: '#5f8f3f', weight: 2.2 },
    ],
    garnish: [
      { type: 'bean', colors: ['#8c2f42', '#a53b4f', '#6f2434'], count: 8 },
      { type: 'dust', colors: ['#4f7a3a', '#679a4d'], count: 34 },
    ],
  },
  {
    slug: 'karamel-garam-laut',
    title: 'Karamel Garam Laut',
    description: 'Ilustrasi puding karamel yang dibalik ke piring dengan saus karamel gelap mengalir di sisinya.',
    seed: 7077,
    backdrop: ['#fdf0dc', '#eecb96'],
    blobs: ['#a8641e', '#e2a752'],
    vessel: { kind: 'flan', sauce: '#9a5a17' },
    layers: [
      { color: '#f3dfb8', weight: 1 },
      { color: '#f7e8c9', weight: 1 },
    ],
    garnish: [
      { type: 'salt', colors: ['#ffffff'], count: 12 },
    ],
  },
  {
    slug: 'taro-ungu-lembut',
    title: 'Taro Ungu Lembut',
    description: 'Ilustrasi puding talas ungu lembut dengan warna ungu pucat alami.',
    seed: 8088,
    backdrop: ['#f4eefb', '#d8c6ee'],
    blobs: ['#6c4a9c', '#b092dd'],
    vessel: { kind: 'glass', style: 'cup' },
    layers: [
      { color: '#7b5aa8', weight: 1.4 },
      { color: '#9878c2', weight: 1.2 },
      { color: '#c0a5e0', weight: 1 },
    ],
    garnish: [
      { type: 'dice', colors: ['#6c4a9c', '#8a68b8', '#a887d4'], count: 6 },
      { type: 'dust', colors: ['#efe6fb'], count: 26 },
    ],
  },
  {
    slug: 'leci-selasih',
    title: 'Leci Selasih',
    description: 'Ilustrasi puding leci bening dalam toples dengan biji selasih dan potongan buah leci.',
    seed: 9099,
    backdrop: ['#f6f1fb', '#ded0ec'],
    blobs: ['#8c6fa8', '#cbb6e0'],
    vessel: { kind: 'glass', style: 'jar' },
    layers: [
      { color: '#d8c4e8', weight: 1 },
      { color: '#e6d6f0', weight: 1.4 },
      { color: '#f2eaf8', weight: 1 },
    ],
    garnish: [
      { type: 'berry', colors: ['#fdf8ff', '#f3e9f7'], count: 6 },
      { type: 'seed', colors: ['#2f2333', '#43324a'], count: 34 },
    ],
  },
  {
    slug: 'durian-monthong',
    title: 'Durian Monthong',
    description: 'Ilustrasi puding durian kuning pekat dengan lapisan krim santan tipis di atasnya.',
    seed: 1212,
    backdrop: ['#fdf6dd', '#eedb92'],
    blobs: ['#c79a16', '#e8cd58'],
    vessel: { kind: 'glass', style: 'coupe' },
    layers: [
      { color: '#d8b02a', weight: 1.6 },
      { color: '#e6c94f', weight: 1 },
      { color: '#f6efdc', weight: 0.6 },
    ],
    garnish: [
      { type: 'dice', colors: ['#e0bb33', '#f0d666', '#c9a119'], count: 7 },
      { type: 'dust', colors: ['#fff6d6'], count: 20 },
    ],
  },

  // ── Cakes ──────────────────────────────────────────────────────────────────
  {
    slug: 'lapis-legit-klasik',
    title: 'Lapis Legit Klasik',
    description: 'Ilustrasi potongan lapis legit dengan banyak lapisan tipis berwarna keemasan.',
    seed: 1313,
    backdrop: ['#fbf0dc', '#e9cf9f'],
    blobs: ['#a9762f', '#d9b264'],
    vessel: {
      kind: 'slab',
      bands: 18,
      palette: ['#e2bd77', '#b98536'],
      glaze: '#caa057',
    },
    garnish: [],
  },
  {
    slug: 'red-velvet-mawar',
    title: 'Red Velvet Mawar',
    description: 'Ilustrasi kue red velvet tiga lapis dengan krim keju dan hiasan mawar krim.',
    seed: 1414,
    backdrop: ['#fdeef0', '#f2bfc8'],
    blobs: ['#a32338', '#e78b9d'],
    vessel: { kind: 'round', frosting: '#f6ece3' },
    layers: [
      { color: '#a32338', weight: 1 },
      { color: '#f6ece3', weight: 0.32 },
      { color: '#a32338', weight: 1 },
      { color: '#f6ece3', weight: 0.32 },
      { color: '#a32338', weight: 1 },
    ],
    garnish: [
      { type: 'petal', colors: ['#c33a52', '#e07d90'], count: 4 },
    ],
  },
  {
    slug: 'brownies-fudge-cokelat-hitam',
    title: 'Brownies Fudge Cokelat Hitam',
    description: 'Ilustrasi potongan brownies cokelat hitam dengan kulit tipis mengkilap di atasnya.',
    seed: 1515,
    backdrop: ['#f2e6da', '#d3b394'],
    blobs: ['#3a2318', '#8a5a37'],
    vessel: { kind: 'brownie', color: '#3a2318', crust: '#7d5333' },
    garnish: [],
  },
  {
    slug: 'cheesecake-yuzu',
    title: 'Cheesecake Yuzu',
    description: 'Ilustrasi cheesecake panggang berwarna kuning lembut dengan dasar biskuit mentega.',
    seed: 1616,
    backdrop: ['#fdf6dc', '#efdd9d'],
    blobs: ['#c9a227', '#f0dd82'],
    vessel: { kind: 'round', frosting: '#f2d98a', finish: 'baked' },
    layers: [
      { color: '#b8894a', weight: 0.4 },
      { color: '#f6e7b8', weight: 1.6 },
    ],
    garnish: [
      { type: 'curl', colors: ['#e8c948', '#f2dd82'], count: 6 },
    ],
  },
  {
    slug: 'bolu-pandan-gula-aren',
    title: 'Bolu Pandan Gula Aren',
    description: 'Ilustrasi bolu chiffon pandan berbentuk tulban dengan siraman gula aren cair.',
    seed: 1717,
    backdrop: ['#f0f6e4', '#cde0b0'],
    blobs: ['#5c8c3e', '#a97b3c'],
    vessel: { kind: 'tube', color: '#8fb861', glaze: '#8a5a22' },
    garnish: [],
  },
  {
    slug: 'opera-kopi-susu',
    title: 'Opera Kopi Susu',
    description: 'Ilustrasi kue opera dengan enam lapisan tipis dan glasir cokelat mengkilap.',
    seed: 1818,
    backdrop: ['#f3e9df', '#d5bda3'],
    blobs: ['#4a342a', '#a98466'],
    vessel: {
      kind: 'slab',
      bands: 8,
      palette: ['#c9a97f', '#4a342a'],
      glaze: '#33221b',
    },
    garnish: [],
  },
]

// ── Background ───────────────────────────────────────────────────────────────

function backdrop(spec) {
  const bgId = `bg-${spec.slug}`
  const ringId = `ring-${spec.slug}`

  const defs = [
    radialGradient(bgId, [
      ['0%', lighten(spec.backdrop[0], 0.2)],
      ['58%', spec.backdrop[0]],
      ['100%', spec.backdrop[1]],
    ], { cx: '46%', cy: '34%', r: '78%' }),
    linearGradient(ringId, [
      ['0%', '#ffffff', '0.55'],
      ['100%', '#ffffff', '0'],
    ], { x1: '0', y1: '0', x2: '1', y2: '1' }),
  ].join('')

  const body = [
    el('rect', { width: '1000', height: '1000', fill: `url(#${bgId})` }),
    // Soft colour washes. They are lightened heavily on purpose: a saturated
    // blob under a Gaussian blur reads as a dirty smudge rather than a glow.
    blob({ cx: 196, cy: 196, r: 240, fill: lighten(spec.blobs[0], 0.62), opacity: '0.55', seed: spec.seed }),
    blob({ cx: 838, cy: 742, r: 268, fill: lighten(spec.blobs[1], 0.55), opacity: '0.5', seed: spec.seed + 5 }),
    blob({ cx: 812, cy: 174, r: 168, fill: lighten(spec.blobs[1], 0.74), opacity: '0.42', seed: spec.seed + 11 }),
    // A thin arc behind the vessel gives the composition a focal ring.
    el('circle', {
      'cx': '500',
      'cy': '470',
      'r': '324',
      'fill': '#ffffff',
      'opacity': '0.2',
    }),
    el('circle', {
      'cx': '500',
      'cy': '470',
      'r': '352',
      'fill': 'none',
      'stroke': `url(#${ringId})`,
      'stroke-width': '3',
    }),
  ].join('')

  return { defs, body }
}

/** Fine paper grain over the whole illustration. */
const grainOverlay = () =>
  el('rect', {
    'width': '1000',
    'height': '1000',
    'filter': 'url(#pk-grain)',
    'opacity': '0.06',
    'style': 'mix-blend-mode:multiply',
  })

// ── Composition ──────────────────────────────────────────────────────────────

function renderVessel(spec) {
  const idPrefix = spec.slug

  switch (spec.vessel.kind) {
    case 'glass':
      return glassVessel({
        style: spec.vessel.style,
        layers: spec.layers,
        idPrefix,
        seed: spec.seed,
      })
    case 'flan':
      return flanVessel({
        layers: spec.layers,
        idPrefix,
        sauceColor: spec.vessel.sauce,
      })
    case 'round':
      return roundCake({
        layers: spec.layers,
        idPrefix,
        frostingColor: spec.vessel.frosting,
        finish: spec.vessel.finish,
        seed: spec.seed,
      })
    case 'tube':
      return tubeCake({
        color: spec.vessel.color,
        glazeColor: spec.vessel.glaze,
        idPrefix,
        seed: spec.seed,
      })
    case 'slab':
      return slabCake({
        idPrefix,
        bands: spec.vessel.bands,
        palette: spec.vessel.palette,
        glazeColor: spec.vessel.glaze,
        seed: spec.seed,
      })
    case 'brownie':
      return brownieStack({
        idPrefix,
        color: spec.vessel.color,
        crustColor: spec.vessel.crust,
        seed: spec.seed,
      })
    default:
      throw new Error(`Unknown vessel kind: ${spec.vessel.kind}`)
  }
}

function build(spec) {
  const background = backdrop(spec)
  const vessel = renderVessel(spec)

  const garnish = (spec.garnish ?? [])
    .map((entry, index) =>
      renderGarnish({
        type: entry.type,
        colors: entry.colors,
        count: entry.count,
        seed: spec.seed + index * 31,
        surface: vessel.surface,
      }))
    .join('')

  // The vessels are drawn to a shared coordinate system, then scaled up as a
  // group so each subject fills its frame without redoing every geometry.
  const subject = el(
    'g',
    { transform: 'translate(500 512) scale(1.12) translate(-500 -512)' },
    vessel.body + garnish,
  )

  return document_({
    size: 1000,
    title: spec.title,
    description: spec.description,
    defs: background.defs + vessel.defs,
    body: background.body + subject + grainOverlay(),
  })
}

// ── Run ──────────────────────────────────────────────────────────────────────

async function main() {
  await mkdir(OUT_DIR, { recursive: true })

  const written = []
  for (const spec of SPECS) {
    const svg = build(spec)
    const file = resolve(OUT_DIR, `${spec.slug}.svg`)
    await writeFile(file, `${svg}\n`, 'utf8')
    written.push(`${spec.slug}.svg  ${String(Math.round(svg.length / 1024))} KB`)
  }

  console.log(`Generated ${written.length} product illustrations in public/images/products/`)
  for (const line of written) console.log(`  · ${line}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})

export { SPECS, build, round, darken }
