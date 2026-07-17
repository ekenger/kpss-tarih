import type { Gun } from './schema'

/**
 * İçeriğe dokunmadan kararlı kimlik.
 * Kart/tuzak nesnelerinde id alanı yok; kimlik dizi indeksiyle taşınıyordu ve
 * JSON sırası değişince kayardı. Bunun yerine kimliği metinden türetiyoruz:
 * gün + ön-yüz metninin kısa hash'i. Sıra değişse bile metin sabit → kimlik sabit.
 */

type Kart = Gun['kartlar'][number]
type Tuzak = Gun['tuzak'][number]
type Deneme = Gun['deneme'][number]

/** FNV-1a 32-bit — küçük, deterministik, tarayıcıda bağımlılıksız. */
export function hash(metin: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < metin.length; i++) {
    h ^= metin.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  // >>> 0 ile işaretsiz 32-bit'e sabitle, 36 tabanında kısa string
  return (h >>> 0).toString(36)
}

export function kartKimlik(gun: number, kart: Kart): string {
  return `k${gun}:${hash(kart.o)}`
}

export function tuzakKimlik(gun: number, t: Tuzak): string {
  return `t${gun}:${hash(t.q)}`
}

export function denemeKimlik(gun: number, s: Pick<Deneme, 'q'>): string {
  return `d${gun}:${hash(s.q)}`
}
