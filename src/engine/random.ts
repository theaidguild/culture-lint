// Deterministic pseudo-random number generation.
//
// Every randomized decision in a Culture-Lint session (scenario queue order,
// tie-breaking, etc.) is derived from a single session seed through the helpers
// below. Given the same seed, the same sequence is always produced, so any
// session can be reproduced or shared via its seed.

const SEED_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const GENERATED_SEED_LENGTH = 6

// mulberry32: a compact, fast, well-distributed 32-bit seeded PRNG.
export const mulberry32 = (seed: number): (() => number) => {
  let state = seed >>> 0

  return () => {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Deterministically fold an arbitrary string into a 32-bit unsigned integer.
export const hashStringToSeed = (value: string): number => {
  let hash = 2166136261 >>> 0

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0
}

// Build an RNG from a human-friendly seed string (or raw numeric seed).
export const createRng = (seed: string | number): (() => number) => {
  const numericSeed = typeof seed === 'number' ? seed >>> 0 : hashStringToSeed(seed)
  return mulberry32(numericSeed)
}

// Fisher-Yates shuffle driven by a provided RNG. Pure: returns a new array.
export const shuffleWithRng = <T>(items: readonly T[], rng: () => number): T[] => {
  const result = items.slice()

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }

  return result
}

// Generate a short, shareable, human-friendly seed string.
export const generateSeed = (): string => {
  let seed = ''

  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const bytes = new Uint8Array(GENERATED_SEED_LENGTH)
    crypto.getRandomValues(bytes)
    for (let index = 0; index < GENERATED_SEED_LENGTH; index += 1) {
      seed += SEED_ALPHABET[bytes[index] % SEED_ALPHABET.length]
    }
    return seed
  }

  for (let index = 0; index < GENERATED_SEED_LENGTH; index += 1) {
    seed += SEED_ALPHABET[Math.floor(Math.random() * SEED_ALPHABET.length)]
  }

  return seed
}

// Normalize free-form user input into a safe, non-empty seed string.
export const normalizeSeed = (value: string): string => {
  const cleaned = value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 24)

  return cleaned.length > 0 ? cleaned : generateSeed()
}
