import { create } from 'zustand'

export type Sekme = 'kodlar' | 'kartlar' | 'tuzak' | 'deneme' | 'eslestir'

interface AppStore {
  aktifGun: number
  aktifSekme: Sekme
  setAktifGun: (gun: number) => void
  setAktifSekme: (sekme: Sekme) => void
}

export const useStore = create<AppStore>((set) => ({
  aktifGun: 0,
  aktifSekme: 'kodlar',
  setAktifGun: (gun) => set({ aktifGun: gun }),
  setAktifSekme: (sekme) => set({ aktifSekme: sekme }),
}))
