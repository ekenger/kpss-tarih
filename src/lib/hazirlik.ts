/**
 * Sınav Hazırlık Skoru — saf model (yan etkisiz; storage/content'e bağlı değil).
 * "Ne kadar çalıştın" değil, "gerçek sınavda kaç net çıkarırsın" ölçülür:
 * konuları sınavdaki gerçek önemine (ağırlık) göre tartıp SRS ustalığıyla çarpar.
 */

const VARSAYILAN_AGIRLIK = 3

/**
 * Günün ağırlığını `meta.tahminiSoru` metninden türetir.
 * "KPSS'de ~4-6 soru" → 5 · "~3-4 soru" → 3.5 · "~5 soru" → 5 · ayrıştırılamazsa 3.
 * Bir gün ayrıştırılamazsa nötr alınır, sessizce bozulmaz.
 */
export function gunAgirligi(tahminiSoru: string): number {
  const m = tahminiSoru.match(/(\d+)\s*(?:[-–]\s*(\d+))?\s*soru/i)
  if (!m) return VARSAYILAN_AGIRLIK
  const x = Number(m[1])
  const y = m[2] !== undefined ? Number(m[2]) : x
  return (x + y) / 2
}

export interface GunGirdi {
  gun: number
  agirlik: number
  /** O günün toplam madde sayısı (kartlar + tuzak). */
  toplamMadde: number
  /** O günde çalışılmış (SRS'e girmiş) madde sayısı. */
  calisilanMadde: number
  /** O gündeki SRS kutularının toplamı (her çalışılan madde 1–5). */
  kutuToplam: number
}

export interface GunHazirlik extends GunGirdi {
  /** Kapsam-farkında ustalık ∈ [0,1]: kutuToplam / (5 × toplamMadde). */
  mastery: number
  /** Öncelik: agirlik × (1 − mastery) — en çok net kazandıracak konu. */
  oncelik: number
}

export interface HazirlikSonuc {
  /** Ağırlıklı hazırlık skoru ∈ [0,1]. */
  skor: number
  /** Kapsam ∈ [0,1]: çalışılan / toplam madde. */
  kapsam: number
  /** Öncelik sırasına (çoktan aza) göre günler. */
  gunler: GunHazirlik[]
}

/** Günün kapsam-farkında ustalığı. Çalışılmayan madde 0 sayılır. */
function masteryOf(g: GunGirdi): number {
  if (g.toplamMadde <= 0) return 0
  return Math.min(1, g.kutuToplam / (5 * g.toplamMadde))
}

export function hazirlikHesapla(gunler: GunGirdi[]): HazirlikSonuc {
  let agirlikToplam = 0
  let agirlikliMastery = 0
  let toplamMadde = 0
  let calisilanMadde = 0

  const detay: GunHazirlik[] = gunler.map((g) => {
    const mastery = masteryOf(g)
    agirlikToplam += g.agirlik
    agirlikliMastery += g.agirlik * mastery
    toplamMadde += g.toplamMadde
    calisilanMadde += Math.min(g.calisilanMadde, g.toplamMadde)
    return { ...g, mastery, oncelik: g.agirlik * (1 - mastery) }
  })

  const skor = agirlikToplam > 0 ? agirlikliMastery / agirlikToplam : 0
  const kapsam = toplamMadde > 0 ? calisilanMadde / toplamMadde : 0
  detay.sort((a, b) => b.oncelik - a.oncelik)
  return { skor, kapsam, gunler: detay }
}
