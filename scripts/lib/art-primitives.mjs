/**
 * Low-level SVG builders shared by the product-art and favicon generators.
 *
 * Everything is deterministic: the same spec always produces byte-identical
 * output, so regenerating art never creates noise in a diff.
 */

/** Deterministic PRNG (mulberry32) — seeded per product so art is stable. */
export function rng(seed) {
  let a = seed >>> 0
  return () => {
    a += 0x6D2B79F5
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const round = (n, digits = 2) => Number.parseFloat(n.toFixed(digits))

/** Mix two hex colours. `mix('#fff', '#000', 0.5)` → '#808080' */
export function mix(from, to, amount) {
  const parse = hex => [1, 3, 5].map(i => Number.parseInt(hex.slice(i, i + 2), 16))
  const [r1, g1, b1] = parse(from)
  const [r2, g2, b2] = parse(to)
  const blend = (a, b) => Math.round(a + (b - a) * amount)
  return `#${[blend(r1, r2), blend(g1, g2), blend(b1, b2)]
    .map(v => v.toString(16).padStart(2, '0'))
    .join('')}`
}

export const lighten = (hex, amount) => mix(hex, '#ffffff', amount)
export const darken = (hex, amount) => mix(hex, '#1b1215', amount)

/** Serialise an attribute map, skipping null/undefined. */
const attrs = map =>
  Object.entries(map)
    .filter(([, value]) => value !== null && value !== undefined && value !== false)
    .map(([key, value]) => `${key}="${value}"`)
    .join(' ')

export const el = (tag, map, children = '') =>
  children === null || children === ''
    ? `<${tag} ${attrs(map)}/>`
    : `<${tag} ${attrs(map)}>${children}</${tag}>`

// ── Gradients ────────────────────────────────────────────────────────────────

export function linearGradient(id, stops, { x1 = '0', y1 = '0', x2 = '0', y2 = '1' } = {}) {
  const body = stops
    .map(([offset, color, opacity]) =>
      el('stop', {
        'offset': offset,
        'stop-color': color,
        'stop-opacity': opacity ?? null,
      }))
    .join('')
  return el('linearGradient', { id, x1, y1, x2, y2 }, body)
}

export function radialGradient(id, stops, { cx = '50%', cy = '50%', r = '50%' } = {}) {
  const body = stops
    .map(([offset, color, opacity]) =>
      el('stop', {
        'offset': offset,
        'stop-color': color,
        'stop-opacity': opacity ?? null,
      }))
    .join('')
  return el('radialGradient', { id, cx, cy, r }, body)
}

// ── Shapes ───────────────────────────────────────────────────────────────────

/**
 * A slab with an elliptical top and bottom — the building block for every
 * layered pudding. `bulge` controls how deep the ellipse looks.
 */
export function layerBand({ cx, top, bottom, halfTop, halfBottom, bulge, fill, opacity }) {
  const d = [
    `M ${round(cx - halfTop)} ${round(top)}`,
    `A ${round(halfTop)} ${round(bulge)} 0 0 0 ${round(cx + halfTop)} ${round(top)}`,
    `L ${round(cx + halfBottom)} ${round(bottom)}`,
    `A ${round(halfBottom)} ${round(bulge)} 0 0 1 ${round(cx - halfBottom)} ${round(bottom)}`,
    'Z',
  ].join(' ')
  return el('path', { d, fill, opacity: opacity ?? null })
}

/** The visible ellipse of a surface (top of a pudding, rim of a glass). */
export const surface = ({ cx, cy, rx, ry, fill, opacity }) =>
  el('ellipse', { cx: round(cx), cy: round(cy), rx: round(rx), ry: round(ry), fill, opacity: opacity ?? null })

/** Soft contact shadow beneath an object. */
export const groundShadow = ({ cx, cy, rx, ry, id }) =>
  el('ellipse', { cx, cy, rx, ry, fill: `url(#${id})` })

/**
 * A drip running down from a rim — used by caramel, glaze and syrup finishes.
 * `length` is how far it runs, `width` the neck width.
 */
export function drip({ x, y, width, length, fill, opacity }) {
  const half = width / 2
  const d = [
    `M ${round(x - half)} ${round(y)}`,
    `C ${round(x - half)} ${round(y + length * 0.6)} ${round(x - half * 1.15)} ${round(y + length)} ${round(x)} ${round(y + length)}`,
    `C ${round(x + half * 1.15)} ${round(y + length)} ${round(x + half)} ${round(y + length * 0.6)} ${round(x + half)} ${round(y)}`,
    'Z',
  ].join(' ')
  return el('path', { d, fill, opacity: opacity ?? null })
}

/** Rounded blob used for background decoration. */
export function blob({ cx, cy, r, fill, opacity, seed = 7 }) {
  const random = rng(seed)
  const points = 8
  const commands = []

  for (let i = 0; i < points; i += 1) {
    const angle = (i / points) * Math.PI * 2
    const radius = r * (0.82 + random() * 0.3)
    const x = cx + Math.cos(angle) * radius
    const y = cy + Math.sin(angle) * radius * 0.92
    commands.push(`${i === 0 ? 'M' : 'L'} ${round(x)} ${round(y)}`)
  }

  return el('path', {
    'd': `${commands.join(' ')} Z`,
    fill,
    opacity: opacity ?? null,
    'filter': 'url(#pk-soft)',
  })
}

/** A small rounded square rotated slightly — fruit dice, azuki, crumb. */
export const dice = ({ x, y, size, fill, rotate = 0, opacity }) =>
  el('rect', {
    'x': round(x - size / 2),
    'y': round(y - size / 2),
    'width': round(size),
    'height': round(size),
    'rx': round(size * 0.28),
    fill,
    opacity: opacity ?? null,
    'transform': `rotate(${round(rotate)} ${round(x)} ${round(y)})`,
  })

/** A teardrop petal, used for rose petals and leaves. */
export function petal({ x, y, length, width, fill, rotate = 0, opacity }) {
  const d = [
    `M 0 ${round(-length / 2)}`,
    `C ${round(width / 2)} ${round(-length / 6)} ${round(width / 2)} ${round(length / 4)} 0 ${round(length / 2)}`,
    `C ${round(-width / 2)} ${round(length / 4)} ${round(-width / 2)} ${round(-length / 6)} 0 ${round(-length / 2)}`,
    'Z',
  ].join(' ')
  return el('path', {
    d,
    fill,
    opacity: opacity ?? null,
    transform: `translate(${round(x)} ${round(y)}) rotate(${round(rotate)})`,
  })
}

/** An irregular shard — chocolate flakes and tuiles. */
export function shard({ x, y, size, fill, rotate = 0, opacity }) {
  const d = `M 0 ${round(-size)} L ${round(size * 0.62)} ${round(size * 0.3)} L ${round(-size * 0.42)} ${round(size * 0.78)} Z`
  return el('path', {
    d,
    fill,
    opacity: opacity ?? null,
    transform: `translate(${round(x)} ${round(y)}) rotate(${round(rotate)})`,
  })
}

/** A thin curl, used for coconut shavings and chocolate curls. */
export function curl({ x, y, size, fill, rotate = 0, opacity }) {
  const d = [
    `M ${round(-size)} 0`,
    `Q 0 ${round(-size * 0.85)} ${round(size)} 0`,
    `Q 0 ${round(-size * 0.4)} ${round(-size)} 0`,
    'Z',
  ].join(' ')
  return el('path', {
    d,
    fill,
    opacity: opacity ?? null,
    transform: `translate(${round(x)} ${round(y)}) rotate(${round(rotate)})`,
  })
}

/** Scatter `count` items along an ellipse on top of a surface. */
export function scatter({ cx, cy, rx, ry, count, seed, render }) {
  const random = rng(seed)
  const out = []

  for (let i = 0; i < count; i += 1) {
    const angle = random() * Math.PI * 2
    const radius = Math.sqrt(random()) * 0.86
    out.push(render({
      x: cx + Math.cos(angle) * rx * radius,
      y: cy + Math.sin(angle) * ry * radius,
      rotate: random() * 360,
      scale: 0.75 + random() * 0.5,
      index: i,
      random,
    }))
  }

  return out.join('')
}

/** Shared filter + pattern definitions every illustration reuses. */
export const sharedDefs = () => [
  el('filter', { id: 'pk-soft', x: '-30%', y: '-30%', width: '160%', height: '160%' },
    el('feGaussianBlur', { stdDeviation: '26' })),
  el('filter', { id: 'pk-glow', x: '-40%', y: '-40%', width: '180%', height: '180%' },
    el('feGaussianBlur', { stdDeviation: '12' })),
  el('filter', { id: 'pk-grain', x: '0', y: '0', width: '100%', height: '100%' }, [
    el('feTurbulence', { type: 'fractalNoise', baseFrequency: '0.9', numOctaves: '3', result: 'noise' }),
    el('feColorMatrix', { type: 'saturate', values: '0' }),
  ].join('')),
  radialGradient('pk-ground', [
    ['0%', '#1b1215', '0.3'],
    ['70%', '#1b1215', '0.08'],
    ['100%', '#1b1215', '0'],
  ]),
  linearGradient('pk-gloss', [
    ['0%', '#ffffff', '0.72'],
    ['55%', '#ffffff', '0.16'],
    ['100%', '#ffffff', '0'],
  ], { x1: '0', y1: '0', x2: '1', y2: '1' }),
].join('')

/** Wrap body content into a complete, standalone SVG document. */
export function document_({ size = 1000, defs = '', body, title, description }) {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-labelledby="pk-title pk-desc">`,
    el('title', { id: 'pk-title' }, title),
    el('desc', { id: 'pk-desc' }, description),
    el('defs', {}, sharedDefs() + defs),
    body,
    '</svg>',
  ].join('')
}
