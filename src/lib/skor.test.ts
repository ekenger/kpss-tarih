import { describe, test, expect } from 'vitest'
import { hesaplaNet, guncelleZayif } from './skor'

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
