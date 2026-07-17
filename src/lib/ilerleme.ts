import type { SrsState, Tur } from './srs'
import { gunAnahtari, vadesiGeldiMi, ilkDurum } from './srs'
import { gunAgirligi, type GunGirdi } from './hazirlik'

/**
 * Genişletilmiş kalıcı katman (v2). storage.ts'in try/catch + sessiz deseni korunur.
 * Tüm yeni veri tek anahtar altında (`zt_v2`) tipli bir nesnede tutulur; eski
 * `zt_gun{n}` (zayıf kart indeksleri) storage.ts'te olduğu gibi kalır — geriye
 * uyumluluk için içerik yüklendiğinde `srsSeedEt` ile SRS'e taşınır.
 */

const ANAHTAR = 'zt_v2'

export interface DenemeKaydi {
  /** Gün no; karışık (günler arası) deneme için 0. */
  gun: number
  tarih: string // YYYY-AA-GG
  dogru: number
  yanlis: number
  net: number
  toplam: number
}

export interface Seri {
  sonCalisma: string // YYYY-AA-GG
  gunSayisi: number
  /** 1 günlük boşluk affı (tolerans) bu seride kullanıldı mı? Temiz ardışık günde sıfırlanır. */
  dondurmaKullanildi: boolean
}

export interface IlerlemeV2 {
  v: 2
  srs: Record<string, SrsState>
  denemeGecmis: DenemeKaydi[]
  seri: Seri
}

function bos(): IlerlemeV2 {
  return { v: 2, srs: {}, denemeGecmis: [], seri: { sonCalisma: '', gunSayisi: 0, dondurmaKullanildi: false } }
}

export function oku(): IlerlemeV2 {
  try {
    const raw = localStorage.getItem(ANAHTAR)
    if (!raw) return bos()
    const p = JSON.parse(raw) as Partial<IlerlemeV2>
    if (!p || p.v !== 2) return bos()
    return {
      v: 2,
      srs: p.srs ?? {},
      denemeGecmis: Array.isArray(p.denemeGecmis) ? p.denemeGecmis : [],
      seri: {
        sonCalisma: p.seri?.sonCalisma ?? '',
        gunSayisi: p.seri?.gunSayisi ?? 0,
        dondurmaKullanildi: p.seri?.dondurmaKullanildi ?? false,
      },
    }
  } catch {
    return bos()
  }
}

function yaz(state: IlerlemeV2): void {
  try {
    localStorage.setItem(ANAHTAR, JSON.stringify(state))
  } catch {
    // localStorage dolu olabilir, sessizce geç
  }
}

// ---- SRS ----

export function tumSrs(): Record<string, SrsState> {
  return oku().srs
}

export function srsGetir(kimlik: string): SrsState | undefined {
  return oku().srs[kimlik]
}

/** Bir SRS durumunu ekler/günceller. */
export function srsKaydet(state: SrsState): void {
  const s = oku()
  s.srs[state.kimlik] = state
  yaz(s)
}

/**
 * Verilen tohumlardan SRS'te henüz olmayanları 1. kutuda (bugün vadeli) oluşturur.
 * Eski zayıf-kart verisini SRS'e taşımak için Kartlar mount'unda çağrılır.
 * Döndürdüğü sayı eklenen yeni durum adedidir.
 */
export function srsSeedEt(
  tohum: { kimlik: string; gun: number; tur: Tur }[],
  bugun: Date
): number {
  const s = oku()
  let eklenen = 0
  for (const t of tohum) {
    if (!s.srs[t.kimlik]) {
      s.srs[t.kimlik] = ilkDurum(t.kimlik, t.gun, t.tur, bugun)
      eklenen++
    }
  }
  if (eklenen) yaz(s)
  return eklenen
}

/** Bugün veya öncesinde vadesi gelmiş tüm SRS durumları. */
export function vadesiGelenler(bugun: Date): SrsState[] {
  return Object.values(oku().srs).filter((st) => vadesiGeldiMi(st, bugun))
}

export interface GunOzet {
  adet: number
  /** Kutu ortalaması (1–5). */
  ort: number
  /** 5. kutudaki (ustalaşılmış) durum sayısı. */
  kutu5: number
}

/** Gün numarasına göre SRS özeti — ustalık göstergeleri için. */
export function srsGunOzetleri(): Record<number, GunOzet> {
  const out: Record<number, GunOzet> = {}
  for (const s of Object.values(oku().srs)) {
    const o = out[s.gun] ?? { adet: 0, ort: 0, kutu5: 0 }
    o.adet++
    o.ort += s.kutu
    if (s.kutu === 5) o.kutu5++
    out[s.gun] = o
  }
  for (const g of Object.keys(out)) {
    const o = out[Number(g)]
    o.ort = o.adet ? o.ort / o.adet : 0
  }
  return out
}

/**
 * Hazırlık modeli girdilerini üretir: her günün ağırlığı (meta.tahminiSoru'dan) +
 * o günün SRS özeti (çalışılan madde, kutu toplamı). Saf `hazirlikHesapla`'ya beslenir.
 */
export function hazirlikGirdileri(
  gunler: { gun: number; tahminiSoru: string; toplamMadde: number }[]
): GunGirdi[] {
  const ozet = srsGunOzetleri()
  return gunler.map((g) => {
    const o = ozet[g.gun]
    return {
      gun: g.gun,
      agirlik: gunAgirligi(g.tahminiSoru),
      toplamMadde: g.toplamMadde,
      calisilanMadde: o?.adet ?? 0,
      kutuToplam: o ? o.ort * o.adet : 0,
    }
  })
}

/** Tüm SRS destesinin toplam özeti — dashboard istatistikleri için. */
export function toplamOzet(): { toplam: number; kutu5: number; ort: number } {
  const hepsi = Object.values(oku().srs)
  const toplam = hepsi.length
  const kutu5 = hepsi.filter((s) => s.kutu === 5).length
  const ort = toplam ? hepsi.reduce((a, s) => a + s.kutu, 0) / toplam : 0
  return { toplam, kutu5, ort }
}

/** En çok karıştırılan (düşük kutuda çok tekrar edilen) durumlar, çoktan aza. */
export function enCokKaristirilan(n = 8): SrsState[] {
  return Object.values(oku().srs)
    .filter((st) => st.kutu <= 2 && st.tekrar > 0)
    .sort((a, b) => b.tekrar - a.tekrar || a.kutu - b.kutu)
    .slice(0, n)
}

// ---- Deneme geçmişi ----

export function denemeKaydet(kayit: Omit<DenemeKaydi, 'tarih'> & { tarih?: string }): void {
  const s = oku()
  s.denemeGecmis.push({ tarih: gunAnahtari(new Date()), ...kayit })
  // sınırsız büyümesin
  if (s.denemeGecmis.length > 200) s.denemeGecmis = s.denemeGecmis.slice(-200)
  yaz(s)
}

export function denemeGecmisi(): DenemeKaydi[] {
  return oku().denemeGecmis
}

// ---- Seri (streak) ----

export function seriGetir(): Seri {
  return oku().seri
}

const GUN_MS = 86_400_000

function anahtarTarih(key: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key)
  return m ? new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])) : null
}

/** `key` (YYYY-AA-GG) ile `bugun` arasındaki tam gün farkı; key geçersizse null. */
function gunFarkiKey(key: string, bugun: Date): number | null {
  const t = anahtarTarih(key)
  if (!t) return null
  const b = new Date(bugun.getFullYear(), bugun.getMonth(), bugun.getDate())
  return Math.round((b.getTime() - t.getTime()) / GUN_MS)
}

/** Son çalışmanın kaç gün öncesi olduğu (0=bugün, 1=dün…); hiç çalışılmadıysa null. */
export function sonCalismaGunOnce(bugun: Date): number | null {
  const sc = oku().seri.sonCalisma
  return sc ? gunFarkiKey(sc, bugun) : null
}

/**
 * Bugün çalışıldı olarak işaretler ve seriyi günceller.
 * - Ardışık gün (fark 1) → +1, tolerans tazelenir.
 * - Tek günlük boşluk (fark 2) → bir kez affedilir: seri korunur/+1, tolerans tükenir.
 * - 2+ günlük boşluk ya da ilk çalışma → 1'e sıfırlanır.
 * Aynı gün tekrar çağrılırsa değişmez.
 */
export function seriGuncelle(bugun: Date): Seri {
  const s = oku()
  const bugunKey = gunAnahtari(bugun)
  if (s.seri.sonCalisma === bugunKey) return s.seri
  const fark = gunFarkiKey(s.seri.sonCalisma, bugun)
  if (fark === 1) {
    s.seri = { sonCalisma: bugunKey, gunSayisi: s.seri.gunSayisi + 1, dondurmaKullanildi: false }
  } else if (fark === 2 && !s.seri.dondurmaKullanildi && s.seri.gunSayisi > 0) {
    s.seri = { sonCalisma: bugunKey, gunSayisi: s.seri.gunSayisi + 1, dondurmaKullanildi: true }
  } else {
    s.seri = { sonCalisma: bugunKey, gunSayisi: 1, dondurmaKullanildi: false }
  }
  yaz(s)
  return s.seri
}

// ---- Yedekleme (dışa/içe aktarma) ----

const YEDEK_ONEK = 'zt'

export interface Yedek {
  app: 'kpss-tarih-kampi'
  tur: 'yedek'
  v: 1
  disaTarih: string
  /** localStorage anahtarı → ham JSON değeri (yalnız `zt*` alanı). */
  veri: Record<string, string>
}

/** Tüm ilerleme verisini (zt* anahtarları) tek JSON string'e serileştirir. */
export function disaAktar(): string {
  const veri: Record<string, string> = {}
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && k.startsWith(YEDEK_ONEK)) {
      const val = localStorage.getItem(k)
      if (val !== null) veri[k] = val
    }
  }
  const yedek: Yedek = { app: 'kpss-tarih-kampi', tur: 'yedek', v: 1, disaTarih: gunAnahtari(new Date()), veri }
  return JSON.stringify(yedek, null, 2)
}

export interface IceAktarSonuc { ok: boolean; adet: number; mesaj: string }

/** Bir yedek JSON'unu doğrulayıp localStorage'a yazar. Bozuk yedeği yazmaz. */
export function iceAktar(json: string): IceAktarSonuc {
  let p: Partial<Yedek>
  try { p = JSON.parse(json) } catch { return { ok: false, adet: 0, mesaj: 'Dosya okunamadı (geçersiz JSON).' } }
  if (!p || p.app !== 'kpss-tarih-kampi' || typeof p.veri !== 'object' || p.veri === null) {
    return { ok: false, adet: 0, mesaj: 'Bu bir KPSS Tarih Kampı yedeği değil.' }
  }
  const veri = p.veri as Record<string, unknown>
  // zt_v2 varsa çözülebilir ve doğru sürüm olmalı — bozuk yedekle üzerine yazmayalım.
  if (typeof veri[ANAHTAR] === 'string') {
    try {
      const ic = JSON.parse(veri[ANAHTAR] as string)
      if (!ic || ic.v !== 2) return { ok: false, adet: 0, mesaj: 'Yedek sürümü uyumsuz.' }
    } catch { return { ok: false, adet: 0, mesaj: 'Yedek bozuk (zt_v2 çözülemedi).' } }
  }
  let n = 0
  try {
    for (const [k, val] of Object.entries(veri)) {
      if (k.startsWith(YEDEK_ONEK) && typeof val === 'string') { localStorage.setItem(k, val); n++ }
    }
  } catch { return { ok: false, adet: n, mesaj: 'Yazma başarısız (depolama dolu olabilir).' } }
  return { ok: true, adet: n, mesaj: `${n} kayıt geri yüklendi.` }
}
