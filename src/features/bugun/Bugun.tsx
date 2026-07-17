import { useEffect, useRef, useState } from 'react'
import { useStore } from '../../store'
import { M } from '../../lib/metin'
import { karistir, hesaplaNet, agirlikliOrneklem } from '../../lib/skor'
import { kartKimlik, tuzakKimlik, denemeKimlik } from '../../lib/kimlik'
import { derecelendir, ilkDurum, gunAnahtari, type SrsState } from '../../lib/srs'
import { loadIndex, loadGun } from '../../lib/content'
import {
  vadesiGelenler, srsGetir, srsKaydet, denemeKaydet, seriGuncelle, seriGetir, sonCalismaGunOnce, toplamOzet, hazirlikGirdileri,
} from '../../lib/ilerleme'
import { hazirlikHesapla } from '../../lib/hazirlik'
import { IkonAlev } from '../../app/ikonlar'
import HazirlikHalka from '../hazirlik/HazirlikHalka'

const HARF = ['A', 'B', 'C', 'D', 'E'] as const
const KARISIK_ADET = 20

interface DesteKart { on: string; arka: string; etiket: string }
interface Soru { q: string; o: readonly string[]; c: number; e: string; gun: number }
interface KonuMeta { gun: number; baslik: string; tahminiSoru: string; toplamMadde: number }

type Mod = 'menu' | 'tekrar' | 'deneme'

export default function Bugun() {
  const bugun = useRef(new Date()).current
  const setAktifGun = useStore((s) => s.setAktifGun)
  const [yukleniyor, setYukleniyor] = useState(true)
  const [icerik, setIcerik] = useState<{ kartlar: Map<string, DesteKart>; denemeler: Soru[]; konular: KonuMeta[] }>(
    { kartlar: new Map(), denemeler: [], konular: [] }
  )
  const [mod, setMod] = useState<Mod>('menu')

  useEffect(() => {
    let iptal = false
    ;(async () => {
      const index = await loadIndex()
      const hazir = index.filter((g) => g.hazir)
      const gunler = await Promise.all(hazir.map((g) => loadGun(g.gun)))
      if (iptal) return
      const kartlar = new Map<string, DesteKart>()
      const denemeler: Soru[] = []
      const konular: KonuMeta[] = []
      for (const g of gunler) {
        const no = g.meta.gun
        for (const k of g.kartlar) {
          kartlar.set(kartKimlik(no, k), { on: k.o, arka: k.a, etiket: `${k.c} · Gün ${no}` })
        }
        for (const t of g.tuzak) {
          kartlar.set(tuzakKimlik(no, t), { on: t.q, arka: `Doğru: ${t.o[t.c]}\n\n${t.n}`, etiket: `Tuzak · Gün ${no}` })
        }
        for (const s of g.deneme) {
          denemeler.push({ q: s.q, o: s.o, c: s.c, e: s.e, gun: no })
          // Vadesi gelen deneme soruları tekrar akışında da çıksın (yetim SRS kaydı kalmasın).
          kartlar.set(denemeKimlik(no, s), { on: s.q, arka: `Doğru: ${s.o[s.c]}\n\n${s.e}`, etiket: `Deneme · Gün ${no}` })
        }
        konular.push({ gun: no, baslik: g.meta.baslik, tahminiSoru: g.meta.tahminiSoru, toplamMadde: g.kartlar.length + g.tuzak.length + g.deneme.length })
      }
      setIcerik({ kartlar, denemeler, konular })
      setYukleniyor(false)
    })()
    return () => { iptal = true }
  }, [])

  if (mod === 'tekrar') return <TekrarAkisi bugun={bugun} icerik={icerik.kartlar} onCik={() => setMod('menu')} />
  if (mod === 'deneme') return <KarisikDeneme havuz={icerik.denemeler} konular={icerik.konular} onCik={() => setMod('menu')} onGun={setAktifGun} />

  const seri = seriGetir()
  const ozet = toplamOzet()
  const bugunCalisti = seri.sonCalisma === gunAnahtari(bugun)
  // Tek gün kaçırıldı ve tolerans hakkı duruyorsa: bugün çalışmak seriyi kurtarır.
  const toleransNudge = !bugunCalisti && sonCalismaGunOnce(bugun) === 2 && !seri.dondurmaKullanildi && seri.gunSayisi > 0
  const vadeli = yukleniyor ? [] : vadesiGelenler(bugun).filter((st) => icerik.kartlar.has(st.kimlik))
  const denemeAdet = Math.min(KARISIK_ADET, icerik.denemeler.length)

  const haz = hazirlikHesapla(hazirlikGirdileri(icerik.konular))
  const yeterliVeri = haz.kapsam >= 0.1
  const zayifKonular = haz.gunler.filter((x) => x.oncelik > 0).slice(0, 3)
  const baslikMap = new Map(icerik.konular.map((k) => [k.gun, k.baslik]))

  return (
    <section>
      <h2 style={h2S}>Bugün</h2>
      <p style={aS}>{M.bugunAciklama}</p>

      {/* Streak hero */}
      <div style={{
        position: 'relative', overflow: 'hidden', borderRadius: 20, padding: '18px 18px 16px',
        background: 'linear-gradient(135deg, rgba(255,162,70,.16), rgba(255,122,60,.05))',
        border: '1px solid rgba(255,162,70,.28)', boxShadow: 'var(--golge-2)', marginBottom: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            display: 'grid', placeItems: 'center', width: 54, height: 54, borderRadius: 16,
            background: 'var(--grad-ates)', color: '#2a1806', flexShrink: 0, boxShadow: 'var(--golge-1)',
            animation: bugunCalisti ? 'nabiz 2.4s ease-in-out infinite' : undefined,
          }}>
            <IkonAlev size={28} />
          </div>
          <div style={{ flexGrow: 1 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 7 }}>
              <span className="tnum" style={{ fontFamily: 'Sofia Sans Condensed, sans-serif', fontWeight: 800, fontSize: 36, lineHeight: 1, color: 'var(--ates)' }}>{seri.gunSayisi}</span>
              <span style={{ fontSize: 14, color: 'var(--sut)', fontWeight: 600 }}>günlük seri</span>
            </div>
            <div style={{ fontSize: 12.5, color: bugunCalisti ? 'var(--yesil)' : 'var(--sis)', marginTop: 2 }}>
              {bugunCalisti ? M.seriBugun : M.seriBekliyor}
            </div>
          </div>
        </div>
        {toleransNudge && (
          <div style={{ marginTop: 12, fontSize: 12.5, color: 'var(--ates)', background: 'rgba(255,162,70,.10)', border: '1px solid rgba(255,162,70,.28)', borderRadius: 12, padding: '9px 11px' }}>
            {M.seriTolerans}
          </div>
        )}
      </div>

      {/* Sınav Hazırlık Skoru */}
      {!yukleniyor && (
        <div style={{ ...kartS, marginBottom: 12, background: 'linear-gradient(135deg, rgba(95,205,196,.10), rgba(57,179,169,.03))', borderColor: 'rgba(95,205,196,.28)' }}>
          <div style={eyebrowS('var(--gok)')}>{M.hazirlikBaslik}</div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <HazirlikHalka yuzde={haz.skor * 100} renk="var(--gok)" etiket={yeterliVeri ? undefined : '—'} boyut={90} />
            <div style={{ flexGrow: 1, minWidth: 0 }}>
              {yeterliVeri ? (
                <>
                  <div style={{ fontSize: 13, color: 'var(--sis)' }}>{M.hazirlikTahmini}</div>
                  <div className="tnum" style={{ fontSize: 12.5, color: 'var(--sis2)', marginTop: 2 }}>{M.hazirlikKapsam(Math.round(haz.kapsam * 100))}</div>
                </>
              ) : (
                <div style={{ fontSize: 13.5, color: 'var(--sis)' }}>{M.hazirlikOlcemiyor}</div>
              )}
            </div>
          </div>

          {zayifKonular.length > 0 ? (
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--sut)' }}>{M.netKazandiran}</div>
              <div style={{ fontSize: 11.5, color: 'var(--sis2)', margin: '2px 0 8px' }}>{M.netKazandiranAlt}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {zayifKonular.map((k) => (
                  <button key={k.gun} onClick={() => setAktifGun(k.gun)} style={konuButonS}>
                    <span className="tnum" style={{ display: 'grid', placeItems: 'center', width: 26, height: 26, flexShrink: 0, borderRadius: 8, background: 'var(--panel)', border: '1px solid var(--cizgi)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, color: 'var(--ates)' }}>{k.gun}</span>
                    <span style={{ flexGrow: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13.5, fontWeight: 600 }}>{baslikMap.get(k.gun)}</span>
                    <span className="tnum" style={{ flexShrink: 0, fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--gok)', fontWeight: 700 }}>{M.soruAgirlik(k.agirlik)}</span>
                    <span aria-hidden style={{ flexShrink: 0, color: 'var(--sis2)', fontSize: 16 }}>›</span>
                  </button>
                ))}
              </div>
            </div>
          ) : yeterliVeri ? (
            <div style={{ marginTop: 12, fontSize: 13.5, color: 'var(--yesil)' }}>{M.konuTamam}</div>
          ) : null}
        </div>
      )}

      {/* Bugünkü tekrar — birincil CTA */}
      <div style={{ ...kartS, borderColor: vadeli.length ? 'rgba(255,162,70,.4)' : 'var(--cizgi)', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flexGrow: 1 }}>
            <div style={eyebrowS('var(--ates)')}>{M.bugunTekrarBaslik}</div>
            <div style={{ fontSize: 15.5, fontWeight: 600 }}>{yukleniyor ? M.yukleniyor : M.bugunSayac(vadeli.length)}</div>
          </div>
          {!yukleniyor && vadeli.length > 0 && (
            <span className="tnum" style={{
              display: 'grid', placeItems: 'center', minWidth: 46, height: 46, padding: '0 8px', borderRadius: 13,
              background: 'var(--grad-ates)', color: '#2a1806', fontFamily: 'Sofia Sans Condensed, sans-serif', fontWeight: 800, fontSize: 22,
            }}>{vadeli.length}</span>
          )}
        </div>
        {!yukleniyor && (vadeli.length > 0
          ? <button style={{ ...anaButonS, marginTop: 14, width: '100%' }} onClick={() => setMod('tekrar')}>Tekrara başla</button>
          : icerik.kartlar.size === 0 && <p style={{ color: 'var(--sis)', fontSize: 13.5, margin: '10px 0 0' }}>{M.bugunHicYok}</p>)}
      </div>

      {/* Karışık deneme */}
      <div style={{ ...kartS, marginBottom: 14 }}>
        <div style={eyebrowS('var(--gok)')}>{M.karisikBaslik}</div>
        <p style={{ color: 'var(--sis)', fontSize: 13.5, margin: '0 0 12px' }}>{M.karisikAciklama}</p>
        <button style={{ ...anaButonS, background: 'var(--grad-gok)', color: '#08201d', width: '100%' }}
          disabled={denemeAdet === 0} onClick={() => setMod('deneme')}>
          {M.karisikBaslat(denemeAdet)}
        </button>
      </div>

      {/* Mini istatistik */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        <Dosemetile buyuk={ozet.toplam} kucuk={M.statOgrenilen} renk="var(--sut)" />
        <Dosemetile buyuk={ozet.kutu5} kucuk={M.statUsta} renk="var(--yesil)" />
        <Dosemetile buyuk={ozet.ort ? ozet.ort.toFixed(1) : '—'} kucuk={M.statOrtKutu} renk="var(--gok)" />
      </div>
    </section>
  )
}

function Dosemetile({ buyuk, kucuk, renk }: { buyuk: number | string; kucuk: string; renk: string }) {
  return (
    <div style={{ background: 'var(--panel)', border: '1px solid var(--cizgi)', borderRadius: 14, padding: '12px 10px', textAlign: 'center' }}>
      <div className="tnum" style={{ fontFamily: 'Sofia Sans Condensed, sans-serif', fontWeight: 800, fontSize: 24, lineHeight: 1, color: renk }}>{buyuk}</div>
      <div style={{ fontSize: 10.5, color: 'var(--sis2)', letterSpacing: '.04em', marginTop: 4 }}>{kucuk}</div>
    </div>
  )
}

/* ---- Vadesi gelen kartların tekrar akışı (recall-first + Leitner) ---- */
function TekrarAkisi({ bugun, icerik, onCik }: { bugun: Date; icerik: Map<string, DesteKart>; onCik: () => void }) {
  const [deste] = useState<SrsState[]>(() => karistir(vadesiGelenler(bugun).filter((st) => icerik.has(st.kimlik))))
  const [idx, setIdx] = useState(0)
  const [arka, setArka] = useState(false)

  function derece(bildi: boolean) {
    if (!arka) return
    const now = new Date()
    srsKaydet(derecelendir(deste[idx], bildi, now))
    seriGuncelle(now)
    setArka(false)
    setIdx((i) => i + 1)
  }

  if (idx >= deste.length) {
    return (
      <section>
        <h2 style={h2S}>{M.bugunTekrarBaslik}</h2>
        <div style={{ ...kartS, borderColor: 'var(--yesil)', textAlign: 'center' }}>
          <div style={{ fontSize: 34, marginBottom: 6 }}>🎉</div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{M.bugunBitti}</div>
          <button style={{ ...anaButonS, marginTop: 14 }} onClick={onCik}>Bugün'e dön</button>
        </div>
      </section>
    )
  }

  const k = icerik.get(deste[idx].kimlik)!
  const ilerleme = ((idx + 1) / deste.length) * 100
  return (
    <section>
      <h2 style={h2S}>{M.bugunTekrarBaslik}</h2>
      <div style={{ height: 5, background: 'var(--panel2)', borderRadius: 99, overflow: 'hidden', margin: '8px 0 10px' }}>
        <div style={{ height: '100%', background: 'var(--grad-ates)', width: `${ilerleme}%`, transition: 'width .3s' }} />
      </div>
      <div className="tnum" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12.5, color: 'var(--sis)', margin: '4px 0 10px' }}>
        {idx + 1} / {deste.length} · {M.kutu(deste[idx].kutu)}
      </div>

      <div
        role="button" tabIndex={0}
        aria-label={arka ? 'Kartın arkası' : 'Kartın ön yüzü — çevirmek için Enter'}
        onClick={() => setArka(!arka)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setArka(!arka) } }}
        style={{ ...destS, borderColor: arka ? 'var(--gok)' : 'var(--cizgi)', animation: 'gel .2s ease' }}
      >
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--sis)', marginBottom: 10 }}>
          {k.etiket} · dokun-çevir
        </div>
        <div style={{ fontSize: arka ? 15 : 17, fontWeight: arka ? 400 : 600, textAlign: arka ? 'left' : 'center', whiteSpace: 'pre-line' }}>
          {arka ? k.arka : k.on}
        </div>
      </div>

      {!arka ? (
        <p style={ipucuS}>{M.hatirla}</p>
      ) : (
        <div style={{ display: 'flex', gap: 8, margin: '10px 0' }}>
          <button onClick={() => derece(false)} style={{ ...butonS, flex: 1 }}>{M.unuttum}</button>
          <button onClick={() => derece(true)} style={{ ...anaButonS, flex: 1 }}>{M.bildim}</button>
        </div>
      )}
    </section>
  )
}

/* ---- Günler arası karışık deneme ---- */
function KarisikDeneme({ havuz, konular, onCik, onGun }: { havuz: Soru[]; konular: KonuMeta[]; onCik: () => void; onGun: (g: number) => void }) {
  // Saf rastgele yerine öncelik-ağırlıklı çekim: ağırlığı yüksek ama zayıf günler
  // daha olası. Rastgelelik korunur (interleaving bozulmaz).
  const [sorular] = useState<Soru[]>(() => {
    const haz = hazirlikHesapla(hazirlikGirdileri(konular))
    const oncelik = new Map(haz.gunler.map((h) => [h.gun, h.oncelik]))
    return agirlikliOrneklem(havuz, KARISIK_ADET, (s) => oncelik.get(s.gun) ?? 0)
  })
  const [idx, setIdx] = useState(0)
  const [dogru, setDogru] = useState(0)
  const [yanlis, setYanlis] = useState(0)
  const [yanlisSorular, setYanlisSorular] = useState<Soru[]>([])
  const [secili, setSecili] = useState<number | null>(null)
  const [bitti, setBitti] = useState(false)

  function sec(i: number) {
    if (secili !== null) return
    const soru = sorular[idx]
    const dogruMu = i === soru.c
    setSecili(i)
    if (dogruMu) setDogru((d) => d + 1)
    else { setYanlis((y) => y + 1); setYanlisSorular((l) => [...l, soru]) }
    // SRS: karışık deneme cevabı da belleğe yazılır (doğru → kutu +1, yanlış → 1. kutu).
    const now = new Date()
    const kim = denemeKimlik(soru.gun, soru)
    const mevcut = srsGetir(kim) ?? ilkDurum(kim, soru.gun, 'deneme', now)
    srsKaydet(derecelendir(mevcut, dogruMu, now))
  }
  function sonraki() {
    if (idx + 1 >= sorular.length) {
      const now = new Date()
      denemeKaydet({ gun: 0, dogru, yanlis, net: hesaplaNet(dogru, yanlis), toplam: sorular.length })
      seriGuncelle(now)
      setBitti(true)
      return
    }
    setIdx(idx + 1); setSecili(null)
  }

  if (bitti) {
    const net = hesaplaNet(dogru, yanlis).toFixed(2)
    return (
      <section>
        <h2 style={h2S}>{M.karisikBaslik}</h2>
        <div style={{ ...kartS, borderColor: 'var(--ates)', textAlign: 'center' }}>
          <div style={eyebrowS('var(--ates)')}>SONUÇ</div>
          <div style={buyukS}>{net}</div>
          <div style={{ color: 'var(--sis)' }}>net · Doğru {dogru} · Yanlış {yanlis} · {sorular.length} soru</div>
          <button style={{ ...anaButonS, marginTop: 14 }} onClick={onCik}>Bugün'e dön</button>
        </div>

        {/* Yanlışların — dokun, konusunun gününe atla */}
        <div style={{ ...kartS, marginTop: 12 }}>
          <div style={eyebrowS('var(--kizil)')}>{M.karisikYanlisBaslik}</div>
          {yanlisSorular.length === 0 ? (
            <p style={{ color: 'var(--yesil)', fontSize: 13.5, margin: 0 }}>{M.karisikYanlisYok}</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {yanlisSorular.map((s, i) => (
                <button key={i} onClick={() => onGun(s.gun)} style={konuButonS}
                  aria-label={`${M.guneGit(s.gun)} — ${s.q}`}>
                  <span className="tnum" style={{ display: 'grid', placeItems: 'center', width: 26, height: 26, flexShrink: 0, borderRadius: 8, background: 'var(--panel)', border: '1px solid var(--cizgi)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, color: 'var(--kizil)' }}>{s.gun}</span>
                  <span style={{ flexGrow: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 13, fontWeight: 500 }}>{s.q}</span>
                  <span aria-hidden style={{ flexShrink: 0, color: 'var(--sis2)', fontSize: 16 }}>›</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    )
  }

  const soru = sorular[idx]
  return (
    <section>
      <h2 style={h2S}>{M.karisikBaslik}</h2>
      <div className="tnum" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12.5, color: 'var(--sis)', margin: '6px 0' }}>
        Soru <b style={{ color: 'var(--ates)' }}>{idx + 1}/{sorular.length}</b>
        {' · '}D: <b style={{ color: 'var(--yesil)' }}>{dogru}</b>
        {' · '}Y: <b style={{ color: 'var(--kizil)' }}>{yanlis}</b>
      </div>
      <div style={soruS}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--gok)', letterSpacing: '.12em', marginBottom: 6 }}>GÜN {soru.gun}</div>
        <div style={{ fontSize: 15.5, fontWeight: 600, marginBottom: 12, whiteSpace: 'pre-line' }}>{soru.q}</div>
        {soru.o.map((o, i) => {
          let bg = 'var(--panel2)', border = 'var(--cizgi)', color = 'var(--sut)'
          if (secili !== null) {
            if (i === soru.c) { bg = 'rgba(116,202,141,.16)'; border = 'var(--yesil)'; color = 'var(--yesil)' }
            else if (i === secili) { bg = 'rgba(239,109,109,.14)'; border = 'var(--kizil)'; color = 'var(--kizil)' }
          }
          return (
            <button key={i} disabled={secili !== null} onClick={() => sec(i)}
              style={{ display: 'block', width: '100%', textAlign: 'left', background: bg, border: `1px solid ${border}`, color, borderRadius: 12, padding: '12px 14px', margin: '7px 0', fontSize: 14.5, fontWeight: 500, cursor: secili !== null ? 'default' : 'pointer', minHeight: 48 }}>
              {HARF[i]}) {o}
            </button>
          )
        })}
        {secili !== null && (
          <>
            <div style={{ borderLeft: '3px solid var(--gok)', background: 'rgba(95,205,196,.08)', padding: '10px 12px', borderRadius: '0 10px 10px 0', fontSize: 13.5, marginTop: 10, animation: 'gel .2s ease' }}>
              <b>{M.cevap}: {HARF[soru.c]}</b> — {soru.e}
            </div>
            <div style={{ marginTop: 10 }}>
              <button style={anaButonS} onClick={sonraki}>{idx === sorular.length - 1 ? M.bitir : M.sonraki}</button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

const eyebrowS = (renk: string): React.CSSProperties => ({ fontFamily: 'JetBrains Mono, monospace', fontSize: 10.5, letterSpacing: '.14em', color: renk, textTransform: 'uppercase', marginBottom: 6 })
const h2S: React.CSSProperties = { fontFamily: 'Sofia Sans Condensed, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', fontSize: 24, margin: '2px 0 2px' }
const aS: React.CSSProperties = { color: 'var(--sis)', fontSize: 13, margin: '0 0 14px' }
const ipucuS: React.CSSProperties = { color: 'var(--sis)', fontSize: 13, margin: '14px 2px', opacity: 0.8, textAlign: 'center' }
const kartS: React.CSSProperties = { background: 'var(--panel)', border: '1px solid var(--cizgi)', borderRadius: 18, padding: 16, boxShadow: 'var(--golge-1)' }
const konuButonS: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', background: 'var(--panel2)', border: '1px solid var(--cizgi)', color: 'var(--sut)', borderRadius: 12, padding: '10px 12px', cursor: 'pointer', minHeight: 46 }
const destS: React.CSSProperties = { background: 'var(--panel)', border: '1px solid var(--cizgi)', borderRadius: 18, minHeight: 210, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', cursor: 'pointer', boxShadow: 'var(--golge-2)' }
const soruS: React.CSSProperties = { background: 'var(--panel)', border: '1px solid var(--cizgi)', borderRadius: 16, padding: 16, margin: '10px 0', animation: 'gel .2s ease' }
const buyukS: React.CSSProperties = { fontFamily: 'Sofia Sans Condensed, sans-serif', fontSize: 44, fontWeight: 800, color: 'var(--ates)', lineHeight: 1.1 }
const butonS: React.CSSProperties = { display: 'inline-block', background: 'var(--panel2)', color: 'var(--sut)', border: '1px solid var(--cizgi)', borderRadius: 12, padding: '12px 16px', fontSize: 15, fontWeight: 700, cursor: 'pointer', minHeight: 48 }
const anaButonS: React.CSSProperties = { ...butonS, background: 'var(--grad-ates)', borderColor: 'transparent', color: '#2a1806' }
