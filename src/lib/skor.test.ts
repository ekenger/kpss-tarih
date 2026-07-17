import { describe, test, expect } from 'vitest'
import { hesaplaNet, guncelleZayif, agirlikliOrneklem } from './skor'

describe('hesaplaNet', () => {
  test('normal net hesabı', () => {
    expect(hesaplaNet(15, 4)).toBeCloseTo(14)
  })
  test('sıfır yanlış', () => {
    expect(hesaplaNet(20, 0)).toBe(20)
  })
  test('negatif net', () => {
    expect(hesaplaNet(0, 8)).toBe(-2)
  })
  test('tam sıfır', () => {
    expect(hesaplaNet(0, 0)).toBe(0)
  })
  test('1 doğru 4 yanlış = 0', () => {
    expect(hesaplaNet(1, 4)).toBe(0)
  })
})

describe('guncelleZayif', () => {
  test('bildiklerimi zayıflardan çıkar', () => {
    const mevcut = [0, 1, 2, 3, 4]
    const bildiklerim = [1, 3]
    expect(guncelleZayif(mevcut, bildiklerim)).toEqual([0, 2, 4])
  })
  test('boş bildiğim → hepsi zayıf kalır', () => {
    expect(guncelleZayif([0, 1, 2], [])).toEqual([0, 1, 2])
  })
  test('hepsini bildim → boş döner', () => {
    expect(guncelleZayif([0, 1, 2], [0, 1, 2])).toEqual([])
  })
  test('boş liste → boş döner', () => {
    expect(guncelleZayif([], [0, 1])).toEqual([])
  })
})

describe('agirlikliOrneklem', () => {
  test('n adet, tekrarsız alt küme döndürür', () => {
    const arr = [1, 2, 3, 4, 5]
    const s = agirlikliOrneklem(arr, 3, () => 1)
    expect(s).toHaveLength(3)
    expect(new Set(s).size).toBe(3)
    s.forEach((x) => expect(arr).toContain(x))
  })
  test('n dizi boyundan büyükse hepsini döndürür', () => {
    expect(agirlikliOrneklem([1, 2], 5, () => 1)).toHaveLength(2)
  })
  test('çok yüksek ağırlıklı öğe pratikte hep seçilir', () => {
    const arr = ['a', 'b', 'c', 'd']
    for (let i = 0; i < 50; i++) {
      const s = agirlikliOrneklem(arr, 2, (x) => (x === 'a' ? 1e6 : 0))
      expect(s).toContain('a')
    }
  })
  test('yüksek ağırlıklı öğe uzun vadede belirgin daha sık seçilir', () => {
    const arr = ['agir', 'hafif']
    let agirSayi = 0
    for (let i = 0; i < 400; i++) {
      if (agirlikliOrneklem(arr, 1, (x) => (x === 'agir' ? 5 : 1))[0] === 'agir') agirSayi++
    }
    // 5:1 ağırlıkta ~%83 beklenir; geniş toleransla kararlı tutuyoruz.
    expect(agirSayi).toBeGreaterThan(280)
  })
})
