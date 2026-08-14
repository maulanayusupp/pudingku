/**
 * Human-readable reference codes for demo orders and contact messages.
 *
 * Crockford-style alphabet: no `I`, `L`, `O`, `U` so a code read over the phone
 * cannot be confused with 1/0 or misheard.
 */

const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

/** `generateReference('PKU')` → `PKU-8F3K2Q` */
export function generateReference(prefix: string, length = 6): string {
  let code = ''

  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    const bytes = new Uint8Array(length)
    globalThis.crypto.getRandomValues(bytes)
    for (const byte of bytes) code += ALPHABET[byte % ALPHABET.length]
  } else {
    for (let i = 0; i < length; i += 1) {
      code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
    }
  }

  return `${prefix}-${code}`
}
