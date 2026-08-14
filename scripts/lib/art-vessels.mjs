/**
 * Vessel renderers.
 *
 * Each function draws one kind of serving vessel filled with the layers it is
 * given, and returns SVG markup. Layers are listed BOTTOM-first, each with a
 * `color` and a `weight` (relative share of the fill height).
 */

import {
  curl,
  darken,
  dice,
  document_,
  drip,
  el,
  layerBand,
  lighten,
  linearGradient,
  petal,
  radialGradient,
  rng,
  round,
  scatter,
  shard,
  surface,
} from './art-primitives.mjs'

const CX = 500

/** Normalise layer weights so they always sum to 1. */
function normalize(layers) {
  const total = layers.reduce((sum, layer) => sum + (layer.weight ?? 1), 0)
  return layers.map(layer => ({ ...layer, share: (layer.weight ?? 1) / total }))
}

/**
 * Fill a tapered vessel between `fillTop` and `fillBottom`.
 * `halfAt(y)` returns the inner half-width at a given y.
 */
function fillLayers({ layers, fillTop, fillBottom, halfAt, bulgeRatio = 0.22, idPrefix }) {
  const normalized = normalize(layers)
  const height = fillBottom - fillTop
  const out = []
  const defs = []

  let cursor = fillBottom

  // Bottom-first so the topmost layer is drawn last and reads as the surface.
  for (let i = 0; i < normalized.length; i += 1) {
    const layer = normalized[i]
    const bandHeight = height * layer.share
    const top = cursor - bandHeight
    const bottom = cursor
    const halfTop = halfAt(top)
    const halfBottom = halfAt(bottom)
    const id = `${idPrefix}-l${i}`

    defs.push(linearGradient(id, [
      ['0%', lighten(layer.color, 0.24)],
      ['48%', layer.color],
      ['100%', darken(layer.color, 0.26)],
    ]))

    out.push(layerBand({
      cx: CX,
      top,
      bottom,
      halfTop,
      halfBottom,
      bulge: halfBottom * bulgeRatio,
      fill: `url(#${id})`,
    }))

    cursor = top
  }

  const topLayer = normalized[normalized.length - 1]
  const topHalf = halfAt(fillTop)
  const surfaceId = `${idPrefix}-surface`

  defs.push(radialGradient(surfaceId, [
    ['0%', lighten(topLayer.color, 0.42)],
    ['60%', lighten(topLayer.color, 0.12)],
    ['100%', darken(topLayer.color, 0.1)],
  ], { cx: '38%', cy: '32%', r: '78%' }))

  out.push(surface({
    cx: CX,
    cy: fillTop,
    rx: topHalf,
    ry: topHalf * bulgeRatio,
    fill: `url(#${surfaceId})`,
  }))

  return {
    markup: out.join(''),
    defs: defs.join(''),
    surfaceY: fillTop,
    surfaceRx: topHalf,
    surfaceRy: topHalf * bulgeRatio,
  }
}

// ── Cup / jar / coupe ────────────────────────────────────────────────────────

/**
 * A tapered glass. `style` tweaks proportions:
 * - `cup`    classic dessert cup, wide rim
 * - `jar`    straight sided with a lip
 * - `coupe`  shallow bowl on a stem
 */
export function glassVessel({ style = 'cup', layers, idPrefix, seed }) {
  const geometry = {
    cup: { rimY: 322, rimRx: 214, baseY: 792, baseRx: 158, wall: 10 },
    jar: { rimY: 316, rimRx: 196, baseY: 796, baseRx: 190, wall: 11 },
    coupe: { rimY: 300, rimRx: 236, baseY: 586, baseRx: 92, wall: 9 },
  }[style]

  const { rimY, rimRx, baseY, baseRx, wall } = geometry
  const halfAt = (y) => {
    const t = (y - rimY) / (baseY - rimY)
    return rimRx - (rimRx - baseRx) * t - wall
  }

  const fillTop = rimY + 46
  const fillBottom = baseY - 12

  const fill = fillLayers({ layers, fillTop, fillBottom, halfAt, idPrefix })
  const random = rng(seed)

  const glassId = `${idPrefix}-glass`
  const glossId = `${idPrefix}-gloss`

  const defs = [
    fill.defs,
    linearGradient(glassId, [
      ['0%', '#ffffff', '0.42'],
      ['30%', '#ffffff', '0.08'],
      ['72%', '#ffffff', '0.03'],
      ['100%', '#ffffff', '0.24'],
    ], { x1: '0', y1: '0', x2: '1', y2: '0' }),
    linearGradient(glossId, [
      ['0%', '#ffffff', '0.66'],
      ['100%', '#ffffff', '0'],
    ], { x1: '0', y1: '0', x2: '0', y2: '1' }),
  ].join('')

  const body = []

  // Ground shadow
  body.push(el('ellipse', {
    cx: CX,
    cy: baseY + (style === 'coupe' ? 218 : 26),
    rx: baseRx * 1.32,
    ry: 30,
    fill: 'url(#pk-ground)',
  }))

  // Stem + foot for the coupe
  if (style === 'coupe') {
    body.push(el('path', {
      d: `M ${CX - 26} ${baseY} L ${CX - 16} ${baseY + 150} L ${CX - 118} ${baseY + 196} A 118 26 0 0 0 ${CX + 118} ${baseY + 196} L ${CX + 16} ${baseY + 150} L ${CX + 26} ${baseY} Z`,
      fill: `url(#${glassId})`,
      stroke: '#ffffff',
      'stroke-opacity': '0.34',
      'stroke-width': '3',
    }))
  }

  // Glass body behind the fill
  const outline = `M ${CX - rimRx} ${rimY} A ${rimRx} ${rimRx * 0.24} 0 0 0 ${CX + rimRx} ${rimY} L ${CX + baseRx} ${baseY} A ${baseRx} ${baseRx * 0.26} 0 0 1 ${CX - baseRx} ${baseY} Z`
  body.push(el('path', { d: outline, fill: `url(#${glassId})` }))

  // The pudding itself
  body.push(fill.markup)

  // Glass front wall + rim highlight
  body.push(el('path', {
    'd': outline,
    'fill': 'none',
    'stroke': '#ffffff',
    'stroke-opacity': '0.5',
    'stroke-width': '4',
  }))
  body.push(el('ellipse', {
    'cx': CX,
    'cy': rimY,
    'rx': rimRx,
    'ry': rimRx * 0.24,
    'fill': 'none',
    'stroke': '#ffffff',
    'stroke-opacity': '0.78',
    'stroke-width': '5',
  }))

  // Vertical gloss streak
  body.push(el('path', {
    d: `M ${CX - rimRx * 0.72} ${rimY + 40} q ${rimRx * 0.1} ${(baseY - rimY) * 0.5} 0 ${(baseY - rimY) * 0.82} l 26 0 q ${rimRx * 0.1} ${-(baseY - rimY) * 0.42} 0 ${-(baseY - rimY) * 0.8} Z`,
    fill: `url(#${glossId})`,
    opacity: '0.5',
  }))

  // Jar lip
  if (style === 'jar') {
    body.push(el('ellipse', {
      'cx': CX,
      'cy': rimY - 14,
      'rx': rimRx + 12,
      'ry': (rimRx + 12) * 0.24,
      'fill': 'none',
      'stroke': '#ffffff',
      'stroke-opacity': '0.4',
      'stroke-width': '10',
    }))
  }

  // Faint condensation dots for a "just out of the fridge" read
  const dots = []
  for (let i = 0; i < 16; i += 1) {
    const t = random()
    const y = rimY + 70 + t * (baseY - rimY - 120)
    const side = random() > 0.5 ? 1 : -1
    const x = CX + side * halfAt(y) * (0.55 + random() * 0.34)
    dots.push(el('circle', { cx: round(x), cy: round(y), r: round(2 + random() * 4), fill: '#ffffff', opacity: round(0.14 + random() * 0.2) }))
  }
  body.push(dots.join(''))

  return {
    defs,
    body: body.join(''),
    surface: { y: fill.surfaceY, rx: fill.surfaceRx, ry: fill.surfaceRy },
  }
}

// ── Turned-out flan on a plate ───────────────────────────────────────────────

export function flanVessel({ layers, idPrefix, sauceColor }) {
  const normalized = normalize(layers)
  const base = normalized[0]
  const top = normalized[normalized.length - 1]
  const plateY = 806
  const domeBottom = 762
  const domeTop = 392
  const bottomRx = 232
  const topRx = 168

  const bodyId = `${idPrefix}-body`
  const plateId = `${idPrefix}-plate`
  const sauceId = `${idPrefix}-sauce`

  const defs = [
    linearGradient(bodyId, [
      ['0%', lighten(top.color, 0.3)],
      ['46%', top.color],
      ['100%', darken(base.color, 0.22)],
    ]),
    radialGradient(plateId, [
      ['0%', '#ffffff'],
      ['74%', '#f3e7d6'],
      ['100%', '#dcc7ab'],
    ], { cx: '42%', cy: '34%', r: '76%' }),
    radialGradient(sauceId, [
      ['0%', lighten(sauceColor, 0.28)],
      ['100%', darken(sauceColor, 0.2)],
    ], { cx: '40%', cy: '32%', r: '72%' }),
  ].join('')

  const body = []

  body.push(el('ellipse', { cx: CX, cy: plateY + 34, rx: 344, ry: 44, fill: 'url(#pk-ground)' }))
  body.push(el('ellipse', { cx: CX, cy: plateY, rx: 330, ry: 74, fill: `url(#${plateId})` }))
  body.push(el('ellipse', { 'cx': CX, 'cy': plateY, 'rx': 330, 'ry': 74, 'fill': 'none', 'stroke': '#c9b193', 'stroke-width': '3', 'stroke-opacity': '0.6' }))

  // Sauce pooled on the plate
  body.push(el('ellipse', { cx: CX, cy: plateY + 4, rx: 276, ry: 58, fill: `url(#${sauceId})`, opacity: '0.92' }))

  // Dome
  body.push(el('path', {
    d: `M ${CX - bottomRx} ${domeBottom} L ${CX - topRx} ${domeTop + 34} Q ${CX - topRx} ${domeTop} ${CX - topRx + 40} ${domeTop} L ${CX + topRx - 40} ${domeTop} Q ${CX + topRx} ${domeTop} ${CX + topRx} ${domeTop + 34} L ${CX + bottomRx} ${domeBottom} A ${bottomRx} ${bottomRx * 0.24} 0 0 1 ${CX - bottomRx} ${domeBottom} Z`,
    fill: `url(#${bodyId})`,
  }))

  // Top face with a caramel pool
  body.push(surface({ cx: CX, cy: domeTop, rx: topRx, ry: topRx * 0.26, fill: lighten(top.color, 0.2) }))
  body.push(surface({ cx: CX, cy: domeTop + 2, rx: topRx * 0.88, ry: topRx * 0.23, fill: `url(#${sauceId})` }))

  // Drips running down the dome
  const positions = [-0.72, -0.34, 0.06, 0.42, 0.78]
  positions.forEach((position, index) => {
    const x = CX + position * topRx
    body.push(drip({
      x,
      y: domeTop + topRx * 0.2,
      width: 26 + index * 4,
      length: 120 + ((index * 47) % 150),
      fill: `url(#${sauceId})`,
      opacity: '0.95',
    }))
  })

  return { defs, body: body.join(''), surface: { y: domeTop, rx: topRx, ry: topRx * 0.26 } }
}

// ── Cakes ────────────────────────────────────────────────────────────────────

/**
 * A whole round cake: cylinder body, frosting top, optional piped rosettes.
 * `finish: 'baked'` swaps the rosettes for the browned rim a water-bath
 * cheesecake actually has.
 */
export function roundCake({ layers, idPrefix, frostingColor, seed, finish = 'piped' }) {
  const normalized = normalize(layers)
  const topY = 356
  const bottomY = 738
  const rx = 268
  const ry = rx * 0.26
  const random = rng(seed)

  const defs = []
  const body = []

  body.push(el('ellipse', { cx: CX, cy: bottomY + 46, rx: rx * 1.24, ry: 42, fill: 'url(#pk-ground)' }))

  // Cake board
  body.push(el('ellipse', { cx: CX, cy: bottomY + 26, rx: rx * 1.16, ry: ry * 1.16, fill: '#efe0cc' }))

  const height = bottomY - topY
  let cursor = bottomY

  for (let i = 0; i < normalized.length; i += 1) {
    const layer = normalized[i]
    const bandHeight = height * layer.share
    const bandTop = cursor - bandHeight
    const id = `${idPrefix}-c${i}`

    defs.push(linearGradient(id, [
      ['0%', lighten(layer.color, 0.16)],
      ['38%', layer.color],
      ['100%', darken(layer.color, 0.22)],
    ], { x1: '0', y1: '0', x2: '1', y2: '0' }))

    body.push(el('path', {
      d: `M ${CX - rx} ${round(bandTop)} L ${CX - rx} ${round(cursor)} A ${rx} ${ry} 0 0 0 ${CX + rx} ${round(cursor)} L ${CX + rx} ${round(bandTop)} A ${rx} ${ry} 0 0 1 ${CX - rx} ${round(bandTop)} Z`,
      fill: `url(#${id})`,
    }))

    cursor = bandTop
  }

  // Frosting top
  const topId = `${idPrefix}-top`
  defs.push(radialGradient(topId, [
    ['0%', lighten(frostingColor, 0.34)],
    ['64%', frostingColor],
    ['100%', darken(frostingColor, 0.12)],
  ], { cx: '38%', cy: '30%', r: '76%' }))

  body.push(surface({ cx: CX, cy: topY, rx, ry, fill: `url(#${topId})` }))

  if (finish === 'piped') {
    // Rosettes piped one at a time around the rim.
    const rosettes = 9
    for (let i = 0; i < rosettes; i += 1) {
      const angle = (i / rosettes) * Math.PI * 2
      const x = CX + Math.cos(angle) * rx * 0.78
      const y = topY + Math.sin(angle) * ry * 0.78
      const size = 30 + random() * 10
      body.push(el('circle', { cx: round(x), cy: round(y), r: round(size), fill: lighten(frostingColor, 0.26) }))
      body.push(el('circle', { cx: round(x - size * 0.2), cy: round(y - size * 0.24), r: round(size * 0.52), fill: lighten(frostingColor, 0.46), opacity: '0.85' }))
    }
  } else {
    // Baked finish: a browned outer ring that fades toward a paler centre.
    body.push(el('ellipse', {
      'cx': CX,
      'cy': topY,
      'rx': round(rx * 0.97),
      'ry': round(ry * 0.97),
      'fill': 'none',
      'stroke': darken(frostingColor, 0.34),
      'stroke-width': '26',
      'stroke-opacity': '0.45',
    }))
    body.push(surface({ cx: CX, cy: topY, rx: rx * 0.7, ry: ry * 0.7, fill: lighten(frostingColor, 0.22), opacity: '0.85' }))
    body.push(el('ellipse', {
      'cx': CX,
      'cy': topY,
      'rx': round(rx * 0.44),
      'ry': round(ry * 0.44),
      'fill': 'none',
      'stroke': '#ffffff',
      'stroke-width': '4',
      'stroke-opacity': '0.4',
    }))
  }

  return { defs: defs.join(''), body: body.join(''), surface: { y: topY, rx: rx * 0.6, ry: ry * 0.6 } }
}

/** A ring / bundt cake with glaze running down the outside. */
export function tubeCake({ color, idPrefix, glazeColor, seed }) {
  const topY = 402
  const bottomY = 706
  const rx = 288
  const ry = rx * 0.28
  const holeRx = 92
  const random = rng(seed)

  const bodyId = `${idPrefix}-body`
  const topId = `${idPrefix}-top`
  const glazeId = `${idPrefix}-glaze`

  const defs = [
    linearGradient(bodyId, [
      ['0%', lighten(color, 0.14)],
      ['40%', color],
      ['100%', darken(color, 0.28)],
    ], { x1: '0', y1: '0', x2: '1', y2: '0' }),
    radialGradient(topId, [
      ['0%', lighten(color, 0.3)],
      ['100%', darken(color, 0.06)],
    ], { cx: '40%', cy: '32%', r: '74%' }),
    linearGradient(glazeId, [
      ['0%', lighten(glazeColor, 0.26)],
      ['100%', darken(glazeColor, 0.24)],
    ]),
  ].join('')

  const body = []

  body.push(el('ellipse', { cx: CX, cy: bottomY + 44, rx: rx * 1.18, ry: 40, fill: 'url(#pk-ground)' }))
  body.push(el('path', {
    d: `M ${CX - rx} ${topY} L ${CX - rx} ${bottomY} A ${rx} ${ry} 0 0 0 ${CX + rx} ${bottomY} L ${CX + rx} ${topY} A ${rx} ${ry} 0 0 1 ${CX - rx} ${topY} Z`,
    fill: `url(#${bodyId})`,
  }))
  body.push(surface({ cx: CX, cy: topY, rx, ry, fill: `url(#${topId})` }))

  // Glaze pooled on the top ring
  body.push(el('path', {
    d: `M ${CX - rx * 0.94} ${topY} A ${rx * 0.94} ${ry * 0.94} 0 0 0 ${CX + rx * 0.94} ${topY} A ${rx * 0.94} ${ry * 0.94} 0 0 0 ${CX - rx * 0.94} ${topY} Z`,
    fill: `url(#${glazeId})`,
    opacity: '0.94',
  }))

  // Drips
  for (let i = 0; i < 11; i += 1) {
    const position = -0.92 + (i / 10) * 1.84
    const x = CX + position * rx * 0.94
    const depth = Math.sqrt(Math.max(0, 1 - position * position))
    body.push(drip({
      x,
      y: topY + ry * 0.9 * depth,
      width: 24 + random() * 16,
      length: 70 + random() * 140,
      fill: `url(#${glazeId})`,
    }))
  }

  // Centre hole
  body.push(surface({ cx: CX, cy: topY, rx: holeRx, ry: holeRx * 0.34, fill: darken(color, 0.45) }))
  body.push(surface({ cx: CX, cy: topY + 8, rx: holeRx * 0.86, ry: holeRx * 0.28, fill: darken(color, 0.62) }))

  return { defs, body: body.join(''), surface: { y: topY, rx: rx * 0.62, ry: ry * 0.62 } }
}

/**
 * A rectangular layered slab seen at a slight angle — used for lapis legit and
 * the opera. `bands` is the number of visible thin layers.
 */
export function slabCake({ idPrefix, bands, palette, glazeColor, seed }) {
  const left = 214
  const rightFront = 786
  const topY = 372
  const bottomY = 706
  const depth = 92
  const random = rng(seed)

  const topId = `${idPrefix}-top`
  const defs = [
    linearGradient(topId, [
      ['0%', lighten(glazeColor, 0.28)],
      ['100%', darken(glazeColor, 0.22)],
    ], { x1: '0', y1: '0', x2: '1', y2: '1' }),
  ].join('')

  const body = []

  body.push(el('ellipse', { cx: CX, cy: bottomY + 52, rx: 340, ry: 40, fill: 'url(#pk-ground)' }))

  // Side face (the depth of the slab)
  body.push(el('path', {
    d: `M ${rightFront} ${topY} L ${rightFront + depth} ${topY - depth * 0.62} L ${rightFront + depth} ${bottomY - depth * 0.62} L ${rightFront} ${bottomY} Z`,
    fill: darken(palette[0], 0.38),
  }))

  // Front face: alternating thin bands
  const height = bottomY - topY
  const bandHeight = height / bands

  for (let i = 0; i < bands; i += 1) {
    const y = topY + i * bandHeight
    const color = palette[i % palette.length]
    body.push(el('rect', {
      x: left,
      y: round(y),
      width: rightFront - left,
      height: round(bandHeight + 0.6),
      fill: i % 2 === 0 ? lighten(color, 0.06) : darken(color, 0.14),
    }))
  }

  // Crumb texture
  for (let i = 0; i < 90; i += 1) {
    body.push(el('circle', {
      cx: round(left + random() * (rightFront - left)),
      cy: round(topY + random() * height),
      r: round(1.2 + random() * 2.6),
      fill: '#ffffff',
      opacity: round(0.04 + random() * 0.08),
    }))
  }

  // Top face
  body.push(el('path', {
    d: `M ${left} ${topY} L ${left + depth} ${topY - depth * 0.62} L ${rightFront + depth} ${topY - depth * 0.62} L ${rightFront} ${topY} Z`,
    fill: `url(#${topId})`,
  }))

  // Glaze sheen on the top face
  body.push(el('path', {
    d: `M ${left + 34} ${topY - 8} L ${left + depth + 10} ${topY - depth * 0.62 + 12} L ${left + depth + 190} ${topY - depth * 0.62 + 12} L ${left + 214} ${topY - 8} Z`,
    fill: '#ffffff',
    opacity: '0.2',
  }))

  return {
    defs,
    body: body.join(''),
    surface: { y: topY - depth * 0.34, rx: (rightFront - left) * 0.42, ry: depth * 0.24 },
  }
}

/** Three brownie squares arranged on a board. */
export function brownieStack({ idPrefix, color, crustColor, seed }) {
  const random = rng(seed)
  const bodyId = `${idPrefix}-body`
  const crustId = `${idPrefix}-crust`

  const defs = [
    linearGradient(bodyId, [
      ['0%', lighten(color, 0.14)],
      ['100%', darken(color, 0.3)],
    ], { x1: '0', y1: '0', x2: '1', y2: '0' }),
    linearGradient(crustId, [
      ['0%', lighten(crustColor, 0.3)],
      ['60%', crustColor],
      ['100%', darken(crustColor, 0.16)],
    ], { x1: '0', y1: '0', x2: '1', y2: '1' }),
  ].join('')

  const body = []
  body.push(el('ellipse', { cx: CX, cy: 792, rx: 330, ry: 42, fill: 'url(#pk-ground)' }))

  // Two squares lying flat, one leaning on top
  const pieces = [
    { x: 300, y: 596, size: 214, depth: 70 },
    { x: 546, y: 620, size: 214, depth: 70 },
    { x: 402, y: 396, size: 206, depth: 66 },
  ]

  for (const piece of pieces) {
    const { x, y, size, depth } = piece

    // Side
    body.push(el('path', {
      d: `M ${x + size} ${y} L ${x + size + depth} ${y - depth * 0.6} L ${x + size + depth} ${y + size - depth * 0.6} L ${x + size} ${y + size} Z`,
      fill: darken(color, 0.4),
    }))
    // Front
    body.push(el('rect', { x, y, width: size, height: size, fill: `url(#${bodyId})`, rx: 8 }))
    // Crackled top
    body.push(el('path', {
      d: `M ${x} ${y} L ${x + depth} ${y - depth * 0.6} L ${x + size + depth} ${y - depth * 0.6} L ${x + size} ${y} Z`,
      fill: `url(#${crustId})`,
    }))

    // Crumb pores on the front face
    for (let i = 0; i < 26; i += 1) {
      body.push(el('circle', {
        cx: round(x + 12 + random() * (size - 24)),
        cy: round(y + 12 + random() * (size - 24)),
        r: round(2 + random() * 5),
        fill: '#ffffff',
        opacity: round(0.05 + random() * 0.09),
      }))
    }

    // Crack lines on the glossy crust
    for (let i = 0; i < 3; i += 1) {
      const sx = x + depth * 0.3 + random() * size * 0.7
      body.push(el('path', {
        'd': `M ${round(sx)} ${round(y - depth * 0.5)} l ${round(20 + random() * 40)} ${round(6 + random() * 10)}`,
        'stroke': '#ffffff',
        'stroke-opacity': '0.3',
        'stroke-width': '3',
        'stroke-linecap': 'round',
        'fill': 'none',
      }))
    }
  }

  return { defs, body: body.join(''), surface: { y: 380, rx: 120, ry: 34 } }
}

// ── Garnish ──────────────────────────────────────────────────────────────────

const GARNISH = {
  dice: (options, colors) => dice({ ...options, size: 26 * options.scale, fill: colors[options.index % colors.length] }),
  bean: (options, colors) => el('ellipse', {
    cx: round(options.x),
    cy: round(options.y),
    rx: round(15 * options.scale),
    ry: round(11 * options.scale),
    fill: colors[options.index % colors.length],
    transform: `rotate(${round(options.rotate)} ${round(options.x)} ${round(options.y)})`,
  }),
  petal: (options, colors) => petal({
    x: options.x,
    y: options.y,
    length: 52 * options.scale,
    width: 30 * options.scale,
    rotate: options.rotate,
    fill: colors[options.index % colors.length],
  }),
  shard: (options, colors) => shard({
    x: options.x,
    y: options.y,
    size: 24 * options.scale,
    rotate: options.rotate,
    fill: colors[options.index % colors.length],
  }),
  curl: (options, colors) => curl({
    x: options.x,
    y: options.y,
    size: 30 * options.scale,
    rotate: options.rotate,
    fill: colors[options.index % colors.length],
  }),
  berry: (options, colors) => el('circle', {
    cx: round(options.x),
    cy: round(options.y),
    r: round(16 * options.scale),
    fill: colors[options.index % colors.length],
  }),
  seed: (options, colors) => el('circle', {
    cx: round(options.x),
    cy: round(options.y),
    r: round(5 * options.scale),
    fill: colors[options.index % colors.length],
    opacity: '0.9',
  }),
  dust: (options, colors) => el('circle', {
    cx: round(options.x),
    cy: round(options.y),
    r: round(3.4 * options.scale),
    fill: colors[options.index % colors.length],
    opacity: round(0.4 + options.random() * 0.4),
  }),
  salt: options => el('rect', {
    'x': round(options.x),
    'y': round(options.y),
    'width': round(6 * options.scale),
    'height': round(6 * options.scale),
    'rx': '1.5',
    'fill': '#ffffff',
    'opacity': '0.92',
    'transform': `rotate(${round(options.rotate)} ${round(options.x)} ${round(options.y)})`,
  }),
}

/** Render one garnish spec on top of a vessel surface. */
export function renderGarnish({ type, colors, count, seed, surface: target }) {
  const render = GARNISH[type]
  if (!render) throw new Error(`Unknown garnish type: ${type}`)

  return scatter({
    cx: CX,
    cy: target.y,
    rx: target.rx * 0.82,
    ry: target.ry * 0.86,
    count,
    seed,
    render: options => render(options, colors),
  })
}

export { CX, document_ }
