import { describe, test, expect, beforeEach } from 'vitest'
import {
  srsSeedEt, srsKaydet, srsGetir, vadesiGelenler, enCokKaristirilan,
  denemeKaydet, denemeGecmisi, seriGuncelle, seriGetir, sonCalismaGunOnce,
  disaAktar, iceAktar,
} from './ilerleme'
import { ilkDurum, derecelendir } from './srs'

const bugun = new Date(2026, 6, 17)

beforeEach(() => localStorage.clear())

describe('srsSeedEt (eski veriden migrasyon)', () => {
  test('eksikleri 1. kutuda oluşturur, adet döner', () => {
    const tohum = [
      { kimlik: 'k1:a', gun: 1, tur: 'kart' as const },
      { kimlik: 'k1:b', gun: 1, tur: 'kart' as const },
    ]
    expect(srsSeedEt(tohum, bugun)).toBe(2)
    expect(srsGetir('k1:a')?.kutu).toBe(1)
  })
  test('idempotent — var olanı ezmez', () => {
    const tohum = [{ kimlik: 'k1:a', gun: 1, tur: 'kart' as const }]
    srsSeedEt(tohum, bugun)
    srsKaydet(derecelendir(srsGetir('k1:a')!, true, bugun)) // kutu 2
    expect(srsSeedEt(tohum, bugun)).toBe(0)
    expect(srsGetir('k1:a')?.kutu).toBe(2)
  })
})

describe('vadesiGelenler', () => {
  test('yalnız vadesi gelenleri döndürür', () => {
    srsKaydet(ilkDurum('k1:a', 1, 'kart', bugun)) // bugün vadeli
    srsKaydet(derecelendir(ilkDurum('k1:b', 1, 'kart', bugun), true, bugun)) // kutu 2 → +3 gün
    const vade = vadesiGelenler(bugun).map((s) => s.kimlik)
    expect(vade).toContain('k1:a')
    expect(vade).not.toContain('k1:b')
  })
})

describe('enCokKaristirilan', () => {
  test('düşük kutuda çok tekrarlıları önce sıralar', () => {
    let a = ilkDurum('k1:a', 1, 'kart', bugun)
    a = derecelendir(a, false, bugun); a = derecelendir(a, false, bugun) // kutu 1, tekrar 2
    srsKaydet(a)
    srsKaydet(derecelendir(ilkDurum('k1:b', 1, 'kart', bugun), false, bugun)) // kutu 1, tekrar 1
    const sonuc = enCokKaristirilan(5)
    expect(sonuc[0].kimlik).toBe('k1:a')
  })
})

describe('denemeKaydet', () => {
  test('kaydı ekler, geçmişten okunur', () => {
    denemeKaydet({ gun: 0, dogru: 15, yanlis: 4, net: 14, toplam: 20 })
    const g = denemeGecmisi()
    expect(g).toHaveLength(1)
    expect(g[0].net).toBe(14)
    expect(g[0].tarih).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('seriGuncelle', () => {
  test('ilk çalışmada seri 1', () => {
    expect(seriGuncelle(bugun).gunSayisi).toBe(1)
  })
  test('aynı gün tekrar → değişmez', () => {
    seriGuncelle(bugun)
    expect(seriGuncelle(bugun).gunSayisi).toBe(1)
  })
  test('ardışık gün → +1', () => {
    seriGuncelle(bugun)
    const yarin = new Date(2026, 6, 18)
    expect(seriGuncelle(yarin).gunSayisi).toBe(2)
  })
  test('2+ günlük boşluk → 1e sıfırlanır', () => {
    seriGuncelle(bugun)
    const sonra = new Date(2026, 6, 20) // 3 gün fark
    expect(seriGuncelle(sonra).gunSayisi).toBe(1)
    expect(seriGetir().sonCalisma).toBe('2026-07-20')
  })
  test('tek günlük boşluk (fark 2) bir kez affedilir → seri korunur', () => {
    seriGuncelle(bugun) // 17
    seriGuncelle(new Date(2026, 6, 18)) // 18 → 2
    const s = seriGuncelle(new Date(2026, 6, 20)) // 19 atlandı, fark 2 → af
    expect(s.gunSayisi).toBe(3)
    expect(s.dondurmaKullanildi).toBe(true)
  })
  test('tolerans tükendiyse ikinci boşluk sıfırlar', () => {
    seriGuncelle(bugun) // 17
    seriGuncelle(new Date(2026, 6, 19)) // fark 2 → af, tolerans tükendi
    expect(seriGuncelle(new Date(2026, 6, 21)).gunSayisi).toBe(1) // yine fark 2 ama af yok
  })
  test('ardışık gün toleransı tazeler', () => {
    seriGuncelle(bugun) // 17
    seriGuncelle(new Date(2026, 6, 19)) // af, tolerans tükendi
    seriGuncelle(new Date(2026, 6, 20)) // ardışık → tolerans tazelenir
    expect(seriGetir().dondurmaKullanildi).toBe(false)
    expect(seriGuncelle(new Date(2026, 6, 22)).gunSayisi).toBe(4) // fark 2 yeniden affedilir
  })
})

describe('sonCalismaGunOnce', () => {
  test('hiç çalışılmadıysa null', () => {
    expect(sonCalismaGunOnce(bugun)).toBeNull()
  })
  test('bugün çalışıldıysa 0, iki gün sonra 2', () => {
    seriGuncelle(bugun)
    expect(sonCalismaGunOnce(bugun)).toBe(0)
    expect(sonCalismaGunOnce(new Date(2026, 6, 19))).toBe(2)
  })
})

describe('yedek (disaAktar / iceAktar)', () => {
  test('round-trip: dışa aktar → temizle → içe aktar veriyi geri getirir', () => {
    srsKaydet(ilkDurum('k1:a', 1, 'kart', bugun))
    denemeKaydet({ gun: 0, dogru: 10, yanlis: 2, net: 9.5, toplam: 12 })
    seriGuncelle(bugun)
    const yedek = disaAktar()

    localStorage.clear()
    expect(srsGetir('k1:a')).toBeUndefined()

    const sonuc = iceAktar(yedek)
    expect(sonuc.ok).toBe(true)
    expect(srsGetir('k1:a')?.kutu).toBe(1)
    expect(denemeGecmisi()).toHaveLength(1)
    expect(seriGetir().gunSayisi).toBe(1)
  })
  test('geçersiz JSON reddedilir, depoyu bozmaz', () => {
    srsKaydet(ilkDurum('k1:a', 1, 'kart', bugun))
    const sonuc = iceAktar('{ bozuk')
    expect(sonuc.ok).toBe(false)
    expect(srsGetir('k1:a')?.kutu).toBe(1)
  })
  test('yabancı yedek reddedilir', () => {
    expect(iceAktar(JSON.stringify({ app: 'baska-app', veri: {} })).ok).toBe(false)
  })
})
