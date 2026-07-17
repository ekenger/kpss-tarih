import { describe, test, expect } from 'vitest'
import {
  sonrakiKutu, sonrakiTarih, vadesiGeldiMi, derecelendir, ilkDurum, gunAnahtari, KUTU_ARALIK,
  type SrsState,
} from './srs'

const bugun = new Date(2026, 6, 17) // 2026-07-17 (yerel)

describe('sonrakiKutu', () => {
  test('bildim → bir üst kutu', () => {
    expect(sonrakiKutu(1, true)).toBe(2)
    expect(sonrakiKutu(3, true)).toBe(4)
  })
  test('bildim → 5. kutuda tavan yapar', () => {
    expect(sonrakiKutu(5, true)).toBe(5)
  })
  test('unuttum → her zaman 1. kutu', () => {
    expect(sonrakiKutu(1, false)).toBe(1)
    expect(sonrakiKutu(5, false)).toBe(1)
  })
})

describe('sonrakiTarih', () => {
  test('kutu aralıklarına göre vade', () => {
    expect(sonrakiTarih(1, bugun)).toBe('2026-07-18') // +1
    expect(sonrakiTarih(3, bugun)).toBe('2026-07-24') // +7
    expect(sonrakiTarih(5, bugun)).toBe('2026-08-16') // +30
  })
  test('KUTU_ARALIK beklenen', () => {
    expect(KUTU_ARALIK).toEqual([1, 3, 7, 14, 30])
  })
})

describe('vadesiGeldiMi', () => {
  const st = (t: string): SrsState => ({ kimlik: 'x', gun: 1, tur: 'kart', kutu: 1, sonrakiTarih: t, tekrar: 0 })
  test('geçmiş/bugün vadesi gelmiştir', () => {
    expect(vadesiGeldiMi(st('2026-07-10'), bugun)).toBe(true)
    expect(vadesiGeldiMi(st('2026-07-17'), bugun)).toBe(true)
  })
  test('gelecek vade henüz gelmemiştir', () => {
    expect(vadesiGeldiMi(st('2026-07-20'), bugun)).toBe(false)
  })
})

describe('ilkDurum + derecelendir', () => {
  test('ilk durum 1. kutu, bugün vadeli', () => {
    const d = ilkDurum('k1:abc', 1, 'kart', bugun)
    expect(d.kutu).toBe(1)
    expect(d.sonrakiTarih).toBe(gunAnahtari(bugun))
    expect(d.tekrar).toBe(0)
  })
  test('bildim derecesi kutuyu ve tekrarı ilerletir', () => {
    const d0 = ilkDurum('k1:abc', 1, 'kart', bugun)
    const d1 = derecelendir(d0, true, bugun)
    expect(d1.kutu).toBe(2)
    expect(d1.tekrar).toBe(1)
    expect(d1.sonrakiTarih).toBe('2026-07-20') // kutu 2 → +3
  })
  test('unuttum kutuyu 1e indirir ama tekrarı yine artırır', () => {
    const d0 = derecelendir(ilkDurum('k1:abc', 1, 'kart', bugun), true, bugun) // kutu 2
    const d1 = derecelendir(d0, false, bugun)
    expect(d1.kutu).toBe(1)
    expect(d1.tekrar).toBe(2)
  })
})
