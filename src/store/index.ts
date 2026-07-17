import { create } from 'zustand'

/** Alt navigasyon: uygulama geneli, her zaman anlamlı. */
export type AnaSekme = 'bugun' | 'gunler' | 'ilerleme'
/** Gün içi modüller: yalnız bir güne girildiğinde anlamlı. */
export type Modul = 'kodlar' | 'kartlar' | 'tuzak' | 'deneme' | 'eslestir'

interface AppStore {
  anaSekme: AnaSekme
  aktifGun: number // 0 = gün seçili değil
  aktifModul: Modul
  /** Global sekmeye geç — açık günden çıkar. */
  setAnaSekme: (s: AnaSekme) => void
  /** Bir güne gir (modülü başa sar). */
  setAktifGun: (gun: number) => void
  setAktifModul: (m: Modul) => void
  /** Açık günden çık, gün listesine dön. */
  gunlereDon: () => void
}

export const useStore = create<AppStore>((set) => ({
  anaSekme: 'bugun',
  aktifGun: 0,
  aktifModul: 'kodlar',
  setAnaSekme: (anaSekme) => set({ anaSekme, aktifGun: 0 }),
  setAktifGun: (aktifGun) => set({ aktifGun, aktifModul: 'kodlar' }),
  setAktifModul: (aktifModul) => set({ aktifModul }),
  gunlereDon: () => set({ aktifGun: 0, anaSekme: 'gunler' }),
}))
