import { describe, test, expect } from 'vitest'
import { GunSchema } from './schema'
import gun01 from '../../content/gun01.json'

describe('GunSchema', () => {
  test('gun01.json şemayı geçmeli', () => {
    expect(() => GunSchema.parse(gun01)).not.toThrow()
  })

  test('meta.gun 1 olmalı', () => {
    const parsed = GunSchema.parse(gun01)
    expect(parsed.meta.gun).toBe(1)
  })

  test('kodlar dolu olmalı', () => {
    const parsed = GunSchema.parse(gun01)
    expect(parsed.kodlar.length).toBeGreaterThan(0)
  })

  test('kartlar dolu olmalı', () => {
    const parsed = GunSchema.parse(gun01)
    expect(parsed.kartlar.length).toBeGreaterThan(0)
  })

  test('deneme 20 soru içermeli', () => {
    const parsed = GunSchema.parse(gun01)
    expect(parsed.deneme.length).toBe(20)
  })

  test('eksik alan → hata atmalı', () => {
    expect(() => GunSchema.parse({ meta: { gun: 1 } })).toThrow()
  })

  test('geçersiz kaynak değeri → hata atmalı', () => {
    const kopyala = JSON.parse(JSON.stringify(gun01))
    kopyala.kodlar[0].i[0].s = 'x'
    expect(() => GunSchema.parse(kopyala)).toThrow()
  })
})
