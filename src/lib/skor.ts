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

/**
 * Ağırlıklı örnekleme, yerine koymadan (Efraimidis–Spirakis A-Res).
 * Her öğeye `anahtar = u^(1/ağırlık)` verilir; en büyük n anahtar seçilir.
 * Ağırlığı yüksek öğe daha olası ama rastgelelik korunur — interleaving bozulmaz.
 * Ağırlık ≤ 0 olan öğe pratikte hiç seçilmez; tüm ağırlıklar eşitse saf rastgeleye döner.
 */
export function agirlikliOrneklem<T>(arr: T[], n: number, agirlik: (t: T) => number): T[] {
  return arr
    .map((t) => ({ t, k: Math.pow(Math.random(), 1 / (Math.max(agirlik(t), 0) + 1e-9)) }))
    .sort((a, b) => b.k - a.k)
    .slice(0, n)
    .map((x) => x.t)
}
