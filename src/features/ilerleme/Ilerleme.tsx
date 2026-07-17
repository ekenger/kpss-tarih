import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../store'
import { M } from '../../lib/metin'
import { kartKimlik, tuzakKimlik, denemeKimlik } from '../../lib/kimlik'
import { gunAnahtari } from '../../lib/srs'
import { loadIndex, loadGun } from '../../lib/content'
import {
  seriGetir, denemeGecmisi, enCokKaristirilan, hazirlikGirdileri,
  disaAktar, iceAktar,
  type DenemeKaydi,
} from '../../lib/ilerleme'
import { hazirlikHesapla } from '../../lib/hazirlik'
import HazirlikHalka from '../hazirlik/HazirlikHalka'

// Ustalık oranına göre ayrık renk paleti (0=kızıl … 1=yeşil).
const KUTU_RENK = ['#3b4b5e', '#ef6d6d', '#ff8a5b', '#ffa246', '#b9c46a', '#74ca8d']
function masteryRenk(mastery: number): string {
  return KUTU_RENK[Math.max(1, Math.min(5, Math.round(mastery * 5)))]
}

interface KonuMeta { gun: number; baslik: string; tahminiSoru: string; toplamMadde: number }

export default function Ilerleme() {
  const setAktifGun = useStore((s) => s.setAktifGun)
  const [metinler, setMetinler] = useState<Map<string, string>>(new Map())
  const [konular, setKonular] = useState<KonuMeta[]>([])

  const seri = seriGetir()
  const gecmis = denemeGecmisi()
  const karisik = enCokKaristirilan(8)

  useEffect(() => {
    let iptal = false
    ;(async () => {
      const index = await loadIndex()
      const hazir = index.filter((g) => g.hazir)
      const guns = await Promise.all(hazir.map((g) => loadGun(g.gun)))
      if (iptal) return
      const m = new Map<string, string>()
      const ks: KonuMeta[] = []
      for (const g of guns) {
        for (const k of g.kartlar) m.set(kartKimlik(g.meta.gun, k), k.o)
        for (const t of g.tuzak) m.set(tuzakKimlik(g.meta.gun, t), t.q)
        for (const s of g.deneme) m.set(denemeKimlik(g.meta.gun, s), s.q)
        ks.push({ gun: g.meta.gun, baslik: g.meta.baslik, tahminiSoru: g.meta.tahminiSoru, toplamMadde: g.kartlar.length + g.tuzak.length + g.deneme.length })
      }
      setKonular(ks)
      setMetinler(m)
    })()
    return () => { iptal = true }
  }, [])

  const haz = hazirlikHesapla(hazirlikGirdileri(konular))
  const yeterliVeri = haz.kapsam >= 0.1
  const baslikMap = new Map(konular.map((k) => [k.gun, k.baslik]))
  const gunSirali = [...haz.gunler].sort((a, b) => a.gun - b.gun)
  const calisan = gunSirali.filter((h) => h.calisilanMadde > 0)
  const oncelikli = haz.gunler.filter((h) => h.oncelik > 0).slice(0, 6)
  const bugunKey = gunAnahtari(new Date())

  return (
    <section>
      <h2 style={h2S}>İlerleme</h2>
      <p style={aS}>{M.ilerlemeAciklama}</p>

      {/* Sınav Hazırlığı — özet, en üstte */}
      <div style={{ ...panelS, background: 'linear-gradient(135deg, rgba(95,205,196,.10), rgba(57,179,169,.03))', borderColor: 'rgba(95,205,196,.28)' }}>
        <div style={etiketS2('var(--gok)')}>{M.hazirlikBaslik}</div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <HazirlikHalka yuzde={haz.skor * 100} renk="var(--gok)" etiket={yeterliVeri ? undefined : '—'} boyut={96} />
          <div style={{ flexGrow: 1 }}>
            {yeterliVeri ? (
              <>
                <div style={{ fontSize: 13, color: 'var(--sis)' }}>{M.hazirlikTahmini}</div>
                <div className="tnum" style={{ fontSize: 12.5, color: 'var(--sis2)', marginTop: 3 }}>{M.hazirlikKapsam(Math.round(haz.kapsam * 100))}</div>
              </>
            ) : (
              <div style={{ fontSize: 13.5, color: 'var(--sis)' }}>{M.hazirlikOlcemiyor}</div>
            )}
          </div>
        </div>
      </div>

      {/* En çok net kazandıran konular */}
      <div style={panelS}>
        <div style={etiketS}>{M.netKazandiran}</div>
        {oncelikli.length === 0 ? (
          <p style={{ color: 'var(--yesil)', fontSize: 13.5, margin: 0 }}>{M.konuTamam}</p>
        ) : (
          <>
            <p style={{ color: 'var(--sis2)', fontSize: 12, margin: '0 0 10px' }}>{M.netKazandiranAlt}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {oncelikli.map((h) => (
                <button key={h.gun} onClick={() => setAktifGun(h.gun)} style={konuButonS}
                  aria-label={`Gün ${h.gun} ${baslikMap.get(h.gun) ?? ''} — ustalık yüzde ${Math.round(h.mastery * 100)}, ağırlık yaklaşık ${h.agirlik} soru`}>
                  <span className="tnum" style={rozetS} aria-hidden>{h.gun}</span>
                  <div style={{ flexGrow: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{baslikMap.get(h.gun)}</div>
                    <div aria-hidden style={{ height: 4, background: 'var(--panel)', borderRadius: 99, overflow: 'hidden', marginTop: 5 }}>
                      <div style={{ height: '100%', width: `${h.mastery * 100}%`, background: masteryRenk(h.mastery), transition: 'width .3s' }} />
                    </div>
                  </div>
                  <span className="tnum" style={{ flexShrink: 0, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--gok)', fontWeight: 700 }}>{M.soruAgirlik(h.agirlik)}</span>
                  <span aria-hidden style={{ flexShrink: 0, color: 'var(--sis2)', fontSize: 16 }}>›</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Ağırlıklı konu ısı haritası */}
      <div style={panelS}>
        <div style={etiketS}>{M.isiBaslik}</div>
        <p style={{ color: 'var(--sis)', fontSize: 12.5, margin: '0 0 10px' }}>{M.isiAciklama}</p>
        {calisan.length === 0 ? (
          <p style={{ color: 'var(--sis)', fontSize: 13.5, margin: 0 }}>{M.isiYok}</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {calisan.map((h) => {
              const pct = Math.round(h.mastery * 100)
              return (
                <button key={h.gun} onClick={() => setAktifGun(h.gun)}
                  aria-label={`Gün ${h.gun} ${baslikMap.get(h.gun) ?? ''} — ustalık yüzde ${pct}, ağırlık yaklaşık ${h.agirlik} soru`}
                  title={`${baslikMap.get(h.gun)} · ustalık %${pct} · ağırlık ~${h.agirlik} soru`}
                  style={{ background: masteryRenk(h.mastery), color: '#12202b', border: 'none', cursor: 'pointer', borderRadius: 9, padding: '6px 6px 5px', minWidth: 50, textAlign: 'center' }}>
                  <div className="tnum" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700 }}>{h.gun}</div>
                  {/* Renk-dışı redundant ustalık sinyali — renk körü de okuyabilir (WCAG 1.4.1). */}
                  <div className="tnum" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 800, marginTop: 1 }}>%{pct}</div>
                  <div className="tnum" style={{ fontSize: 9, fontWeight: 700, opacity: 0.7, marginTop: 1 }}>~{h.agirlik}</div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Seri */}
      <div style={{ ...panelS, borderColor: seri.sonCalisma === bugunKey ? 'var(--yesil)' : 'var(--cizgi)' }}>
        <div style={etiketS}>{M.seriBaslik}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span className="tnum" style={{ fontFamily: 'Sofia Sans Condensed, sans-serif', fontSize: 40, fontWeight: 800, color: 'var(--ates)' }}>🔥 {seri.gunSayisi}</span>
          <span style={{ color: 'var(--sis)', fontSize: 14 }}>{M.seriGun(seri.gunSayisi)}</span>
        </div>
        <div style={{ fontSize: 13, color: seri.sonCalisma === bugunKey ? 'var(--yesil)' : 'var(--sis)', marginTop: 4 }}>
          {seri.sonCalisma === bugunKey ? M.seriBugun : M.seriBekliyor}
        </div>
      </div>

      {/* Deneme netleri */}
      <div style={panelS}>
        <div style={etiketS}>{M.skorBaslik}</div>
        {gecmis.length === 0
          ? <p style={{ color: 'var(--sis)', fontSize: 13.5, margin: 0 }}>{M.skorYok}</p>
          : <NetGrafik gecmis={gecmis} />}
      </div>

      {/* En çok karıştırdıkların */}
      <div style={panelS}>
        <div style={etiketS}>{M.karistirBaslik}</div>
        {karisik.length === 0 ? (
          <p style={{ color: 'var(--sis)', fontSize: 13.5, margin: 0 }}>{M.karistirYok}</p>
        ) : (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {karisik.map((s) => (
              <li key={s.kimlik} style={{ display: 'flex', gap: 10, alignItems: 'baseline', padding: '7px 0', borderBottom: '1px solid var(--cizgi)' }}>
                <span className="tnum" style={{ flex: '0 0 auto', background: 'var(--panel2)', color: 'var(--kizil)', borderRadius: 6, padding: '2px 7px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700 }}>×{s.tekrar}</span>
                <span style={{ fontSize: 13.5, color: 'var(--sut)' }}>{metinler.get(s.kimlik) ?? `Gün ${s.gun}`}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Verilerim & Yedek */}
      <YedekPaneli />
    </section>
  )
}

/** İlerlemeyi JSON olarak indir / geri yükle — cihaz değişiminde veri kaybını önler. */
function YedekPaneli() {
  const dosyaRef = useRef<HTMLInputElement>(null)
  const [mesaj, setMesaj] = useState<{ ok: boolean; metin: string } | null>(null)

  function indir() {
    const blob = new Blob([disaAktar()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kpss-tarih-yedek-${gunAnahtari(new Date())}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function dosyaSecildi(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    e.target.value = '' // aynı dosya tekrar seçilebilsin
    if (!f) return
    const sonuc = iceAktar(await f.text())
    if (sonuc.ok) {
      setMesaj({ ok: true, metin: M.yedekBasarili(sonuc.adet) })
      setTimeout(() => window.location.reload(), 900)
    } else {
      setMesaj({ ok: false, metin: sonuc.mesaj })
    }
  }

  return (
    <div style={panelS}>
      <div style={etiketS}>{M.yedekBaslik}</div>
      <p style={{ color: 'var(--sis)', fontSize: 12.5, margin: '0 0 12px' }}>{M.yedekAciklama}</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button style={yedekButonS} onClick={indir}>{M.yedekIndir}</button>
        <button style={yedekButonS} onClick={() => dosyaRef.current?.click()}>{M.yedekYukle}</button>
        <input ref={dosyaRef} type="file" accept="application/json,.json" onChange={dosyaSecildi} style={{ display: 'none' }} />
      </div>
      {mesaj && (
        <div style={{ marginTop: 10, fontSize: 13, color: mesaj.ok ? 'var(--yesil)' : 'var(--kizil)' }}>{mesaj.metin}</div>
      )}
    </div>
  )
}

/** Deneme netleri — bağımsız inline SVG alan/çizgi grafiği (harici kütüphane yok). */
function NetGrafik({ gecmis }: { gecmis: DenemeKaydi[] }) {
  const veri = gecmis.slice(-24)
  const W = 320, H = 116, padX = 6, padT = 10, padB = 18
  const ic = H - padT - padB
  const oran = (d: DenemeKaydi) => (d.toplam ? Math.max(0, Math.min(1, d.net / d.toplam)) : 0)
  const x = (i: number) => veri.length <= 1 ? W / 2 : padX + (i * (W - padX * 2)) / (veri.length - 1)
  const y = (r: number) => padT + (1 - r) * ic
  const nokta = veri.map((d, i) => ({ px: x(i), py: y(oran(d)), d }))
  const cizgi = nokta.map((p) => `${p.px},${p.py}`).join(' ')
  const alan = `${padX},${padT + ic} ${cizgi} ${W - padX},${padT + ic}`
  const son = nokta[nokta.length - 1]

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Deneme netleri zaman serisi" style={{ display: 'block' }}>
        <defs>
          <linearGradient id="netAlan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--ates)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--ates)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1={padX} y1={y(0.5)} x2={W - padX} y2={y(0.5)} stroke="var(--cizgi)" strokeWidth="1" strokeDasharray="3 4" />
        <line x1={padX} y1={y(1)} x2={W - padX} y2={y(1)} stroke="var(--cizgi)" strokeWidth="1" strokeOpacity="0.5" />
        {veri.length > 1 && <polygon points={alan} fill="url(#netAlan)" />}
        {veri.length > 1 && <polyline points={cizgi} fill="none" stroke="var(--ates)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />}
        {nokta.map((p, i) => (
          <circle key={i} cx={p.px} cy={p.py} r={i === nokta.length - 1 ? 3.6 : 2} fill={i === nokta.length - 1 ? 'var(--ates)' : 'var(--gece)'} stroke="var(--ates)" strokeWidth="1.6" />
        ))}
        {son && <text x={Math.min(son.px, W - 22)} y={Math.max(son.py - 7, 9)} textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--ates)" fontFamily="JetBrains Mono, monospace">{son.d.net.toFixed(1)}</text>}
      </svg>
      <div className="tnum" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11.5, color: 'var(--sis2)', marginTop: 2 }}>
        Son {veri.length} deneme · nokta = bir oturum
      </div>
    </div>
  )
}

const h2S: React.CSSProperties = { fontFamily: 'Sofia Sans Condensed, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', fontSize: 24, margin: '2px 0 2px' }
const aS: React.CSSProperties = { color: 'var(--sis)', fontSize: 13, margin: '0 0 14px' }
const panelS: React.CSSProperties = { background: 'var(--panel)', border: '1px solid var(--cizgi)', borderRadius: 16, padding: 16, margin: '12px 0', boxShadow: 'var(--golge-1)' }
const etiketS: React.CSSProperties = { fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '.12em', color: 'var(--ates)', textTransform: 'uppercase', marginBottom: 10 }
const etiketS2 = (renk: string): React.CSSProperties => ({ ...etiketS, color: renk })
const rozetS: React.CSSProperties = { display: 'grid', placeItems: 'center', width: 26, height: 26, flexShrink: 0, borderRadius: 8, background: 'var(--panel)', border: '1px solid var(--cizgi)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, color: 'var(--ates)' }
const konuButonS: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', background: 'var(--panel2)', border: '1px solid var(--cizgi)', color: 'var(--sut)', borderRadius: 12, padding: '10px 12px', cursor: 'pointer', minHeight: 46 }
const yedekButonS: React.CSSProperties = { flex: '1 1 auto', background: 'var(--panel2)', color: 'var(--sut)', border: '1px solid var(--cizgi)', borderRadius: 12, padding: '11px 14px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', minHeight: 44 }
