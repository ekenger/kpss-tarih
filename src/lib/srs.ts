/**
 * Aralıklı tekrar — Leitner kutu sistemi (saf mantık, yan etkisiz).
 * 5 kutu, artan aralık. Bildim → bir üst kutu (daha seyrek); Unuttum → 1. kutu.
 * skor.ts gibi storage'a bağımlı değildir; sadece durum + tarih hesaplar.
 */

export type Tur = 'kart' | 'tuzak' | 'deneme'
export type Kutu = 1 | 2 | 3 | 4 | 5

/** Kutu başına gün aralığı: kutu N → KUTU_ARALIK[N-1] gün sonra tekrar. */
export const KUTU_ARALIK = [1, 3, 7, 14, 30] as const
export const MAX_KUTU = 5

export interface SrsState {
  kimlik: string
  gun: number
  tur: Tur
  kutu: Kutu
  /** Bir sonraki tekrarın vadesi (YYYY-AA-GG, yerel gün). */
  sonrakiTarih: string
  /** Toplam kaç kez görüldü — "en çok karıştırdıkların" için. */
  tekrar: number
}

/** Bir Date'i yerel güne göre YYYY-AA-GG string'ine indirger (saat bilgisi atılır). */
export function gunAnahtari(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const g = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${g}`
}

export function sonrakiKutu(kutu: Kutu, bildim: boolean): Kutu {
  if (!bildim) return 1
  return Math.min(kutu + 1, MAX_KUTU) as Kutu
}

/** Verilen kutu için bugünden itibaren vade tarihini döndürür. */
export function sonrakiTarih(kutu: Kutu, bugun: Date): string {
  const gunEkle = KUTU_ARALIK[kutu - 1]
  const t = new Date(bugun)
  t.setDate(t.getDate() + gunEkle)
  return gunAnahtari(t)
}

export function vadesiGeldiMi(state: SrsState, bugun: Date): boolean {
  return state.sonrakiTarih <= gunAnahtari(bugun)
}

/** Yeni bir kartın ilk SRS durumu: 1. kutu, bugün vadesi gelmiş. */
export function ilkDurum(kimlik: string, gun: number, tur: Tur, bugun: Date): SrsState {
  return { kimlik, gun, tur, kutu: 1, sonrakiTarih: gunAnahtari(bugun), tekrar: 0 }
}

/** Bir cevaba göre durumu ilerletir (saf; yeni nesne döner). */
export function derecelendir(state: SrsState, bildim: boolean, bugun: Date): SrsState {
  const kutu = sonrakiKutu(state.kutu, bildim)
  return {
    ...state,
    kutu,
    sonrakiTarih: sonrakiTarih(kutu, bugun),
    tekrar: state.tekrar + 1,
  }
}
