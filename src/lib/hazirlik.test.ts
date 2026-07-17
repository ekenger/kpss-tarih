import { describe, test, expect } from 'vitest'
import { gunAgirligi, hazirlikHesapla, type GunGirdi } from './hazirlik'

describe('gunAgirligi', () => {
  test('aralık → ortalama', () => {
    expect(gunAgirligi("KPSS'de ~4-6 soru")).toBe(5)
    expect(gunAgirligi("KPSS'de ~3-4 soru")).toBe(3.5)
  })
  test('tekil sayı', () => {
    expect(gunAgirligi('~5 soru')).toBe(5)
  })
  test('AGS varyantı ve parantez', () => {
    expect(gunAgirligi("KPSS/AGS'de ~3-4 soru (Çağdaş kesişimi)")).toBe(3.5)
  })
  test('en-dash toleransı', () => {
    expect(gunAgirligi('~2–4 soru')).toBe(3)
  })
  test('ayrıştırılamaz → nötr 3', () => {
    expect(gunAgirligi('belirsiz')).toBe(3)
    expect(gunAgirligi('')).toBe(3)
  })
})

const g = (gun: number, agirlik: number, toplamMadde: number, calisilanMadde: number, kutuToplam: number): GunGirdi =>
  ({ gun, agirlik, toplamMadde, calisilanMadde, kutuToplam })

describe('hazirlikHesapla', () => {
  test('boş girdi → sıfır', () => {
    const r = hazirlikHesapla([])
    expect(r.skor).toBe(0)
    expect(r.kapsam).toBe(0)
    expect(r.gunler).toEqual([])
  })

  test('tam ustalık → skor 1', () => {
    // 10 madde, hepsi kutu 5 → kutuToplam 50 → mastery 1
    const r = hazirlikHesapla([g(1, 5, 10, 10, 50)])
    expect(r.skor).toBeCloseTo(1)
    expect(r.kapsam).toBeCloseTo(1)
  })

  test('ağırlıklı ortalama doğru', () => {
    // Gün A: ağırlık 5, mastery 1 (kutuToplam 25/ (5*5)) ; Gün B: ağırlık 1, mastery 0
    const r = hazirlikHesapla([g(1, 5, 5, 5, 25), g(2, 1, 5, 0, 0)])
    // skor = (5*1 + 1*0) / (5+1) = 5/6
    expect(r.skor).toBeCloseTo(5 / 6)
    // kapsam = (5 + 0) / (5 + 5) = 0.5
    expect(r.kapsam).toBeCloseTo(0.5)
  })

  test('öncelik: yüksek ağırlık + düşük ustalık üste', () => {
    const az = g(1, 6, 10, 0, 0)     // ağırlık 6, mastery 0 → öncelik 6
    const iyi = g(2, 6, 10, 10, 50)  // ağırlık 6, mastery 1 → öncelik 0
    const r = hazirlikHesapla([iyi, az])
    expect(r.gunler[0].gun).toBe(1)
    expect(r.gunler[0].oncelik).toBeCloseTo(6)
    expect(r.gunler[1].oncelik).toBeCloseTo(0)
  })

  test('mastery kapsam-farkında: yarısı çalışılmış tam kutu → 0.5', () => {
    // 10 madde, 5 çalışılmış hepsi kutu 5 → kutuToplam 25 → mastery 25/50 = .5
    const r = hazirlikHesapla([g(1, 3, 10, 5, 25)])
    expect(r.gunler[0].mastery).toBeCloseTo(0.5)
  })
})
