/** Net = Doğru − Yanlış / 4 */
export function hesaplaNet(dogru: number, yanlis: number): number {
  return dogru - yanlis / 4
}

/**
 * Zayıf kartları günceller:
 * bildiklerim kümesindeki indeksler listeden çıkar,
 * geri kalanlar zayıf deste olarak döner.
 */
export function guncelleZayif(mevcutZayif: number[], bildiklerim: number[]): number[] {
  const bildikSet = new Set(bildiklerim)
  return mevcutZayif.filter((i) => !bildikSet.has(i))
}

export function karistir<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
