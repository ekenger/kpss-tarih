import { describe, test, expect } from 'vitest'
import { hash, kartKimlik, tuzakKimlik, denemeKimlik } from './kimlik'
import type { Gun } from './schema'

type Kart = Gun['kartlar'][number]
type Tuzak = Gun['tuzak'][number]
type Deneme = Gun['deneme'][number]

const kart = (o: string): Kart => ({ c: 'Kat', o, a: 'cevap' })
const tuzak = (q: string): Tuzak => ({ q, o: ['a', 'b'], c: 0, n: 'not' })
const deneme = (q: string): Deneme => ({ q, o: ['a', 'b', 'c', 'd', 'e'], c: 0, e: 'exp' })

describe('hash', () => {
  test('deterministik', () => {
    expect(hash('Barış Suyu Projesi')).toBe(hash('Barış Suyu Projesi'))
  })
  test('farklı metin → farklı hash', () => {
    expect(hash('abc')).not.toBe(hash('abd'))
  })
})

describe('kartKimlik', () => {
  test('sıra değişse de aynı kart aynı kimlik (indeksten bağımsız)', () => {
    const k = kart('Gorbaçov son SSCB lideridir')
    expect(kartKimlik(29, k)).toBe(kartKimlik(29, k))
  })
  test('gün numarası kimliğe girer', () => {
    const k = kart('aynı ön yüz')
    expect(kartKimlik(1, k)).not.toBe(kartKimlik(2, k))
  })
  test('farklı ön yüz → farklı kimlik', () => {
    expect(kartKimlik(1, kart('A'))).not.toBe(kartKimlik(1, kart('B')))
  })
  test('kart ile tuzak kimlik uzayları çakışmaz', () => {
    expect(kartKimlik(1, kart('X'))).not.toBe(tuzakKimlik(1, tuzak('X')))
  })
})

describe('denemeKimlik', () => {
  test('sıra/gün bağımsız, soru metninden kararlı', () => {
    const s = deneme('Yasemin Devrimi hangi ülkede?')
    expect(denemeKimlik(30, s)).toBe(denemeKimlik(30, s))
  })
  test('kart/tuzak/deneme kimlik uzayları çakışmaz (aynı metinde bile)', () => {
    const kd = kartKimlik(1, kart('X'))
    const td = tuzakKimlik(1, tuzak('X'))
    const dd = denemeKimlik(1, deneme('X'))
    expect(new Set([kd, td, dd]).size).toBe(3)
  })
})
