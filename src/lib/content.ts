import type { Gun } from './schema'

const cache = new Map<number, Gun>()

export async function loadGun(gun: number): Promise<Gun> {
  if (cache.has(gun)) return cache.get(gun)!
  const pad = String(gun).padStart(2, '0')
  const mod = await import(`../../content/gun${pad}.json`)
  const data = mod.default as Gun
  cache.set(gun, data)
  return data
}

export interface GunIndex {
  gun: number
  baslik: string
  hazir: boolean
}

let indexCache: GunIndex[] | null = null

export async function loadIndex(): Promise<GunIndex[]> {
  if (indexCache) return indexCache
  const mod = await import('../../content/index.json')
  indexCache = mod.default as GunIndex[]
  return indexCache
}
