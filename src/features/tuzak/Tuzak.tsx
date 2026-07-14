import { useState, useCallback, useEffect } from 'react'
import type { Gun } from '../../lib/schema'
import { M } from '../../lib/metin'
import { karistir } from '../../lib/skor'

interface Props { gun: Gun }

type Durum = 'soru' | 'bitti'

// Soru sırası ve — her sorunun şık sırası — çalışma anında karıştırılır,
// böylece doğru cevap ekranda hep aynı konumda kalmaz.
const yeniSira = (g: Gun) => karistir(g.tuzak.map((_, i) => i))
const yeniSecSira = (g: Gun) => g.tuzak.map((t) => karistir(t.o.map((_, i) => i)))

export default function Tuzak({ gun }: Props) {
  const [sira, setSira] = useState<number[]>(() => yeniSira(gun))
  const [secSira, setSecSira] = useState<number[][]>(() => yeniSecSira(gun))
  const [idx, setIdx] = useState(0)
  const [dogru, setDogru] = useState(0)
  const [seri, setSeri] = useState(0)
  const [yanlisList, setYanlisList] = useState<number[]>([])
  const [secili, setSecili] = useState<number | null>(null) // ekrandaki gösterim konumu
  const [durum, setDurum] = useState<Durum>('soru')

  const baslat = useCallback((liste?: number[]) => {
    setSira(liste ? liste.slice() : yeniSira(gun))
    setSecSira(yeniSecSira(gun))
    setIdx(0); setDogru(0); setSeri(0); setYanlisList([]); setSecili(null); setDurum('soru')
  }, [gun])

  const qi = sira[idx]
  const soru = gun.tuzak[qi]
  const perm = secSira[qi] // gösterim konumu -> orijinal şık indeksi

  const sec = useCallback((gp: number) => {
    if (secili !== null) return
    setSecili(gp)
    const dogruMu = perm[gp] === soru.c
    if (dogruMu) { setDogru((d) => d + 1); setSeri((s) => s + 1) }
    else { setYanlisList((y) => [...y, qi]); setSeri(0) }
  }, [secili, perm, soru, qi])

  const sonraki = useCallback(() => {
    if (idx + 1 >= sira.length) { setDurum('bitti'); return }
    setIdx(idx + 1); setSecili(null)
  }, [idx, sira.length])

  // Klavye: rakamlarla cevapla, Enter/→/Space ile ilerle — hızlı tekrar için.
  useEffect(() => {
    if (durum !== 'soru') return
    function onKey(e: KeyboardEvent) {
      if (secili === null) {
        const n = Number(e.key)
        if (Number.isInteger(n) && n >= 1 && n <= perm.length) { e.preventDefault(); sec(n - 1) }
      } else if (e.key === 'Enter' || e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault(); sonraki()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [durum, secili, perm, sec, sonraki])

  if (durum === 'bitti') {
    const y = yanlisList.length
    return (
      <section>
        <h2 style={h2S}>Tuzak Avı</h2>
        <div style={ozetS}>
          <div style={buyukS}>{dogru} / {sira.length}</div>
          <div>{y ? M.tuzakYanlis(y) : M.tuzakTemiz}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            {y > 0 && (
              <button style={anaButonS} onClick={() => baslat(karistir(yanlisList))}>
                {M.yanlislariCoz}
              </button>
            )}
            <button style={butonS} onClick={() => baslat()}>{M.bastan}</button>
          </div>
        </div>
      </section>
    )
  }

  const dogruGp = secili !== null ? perm.indexOf(soru.c) : -1
  return (
    <section>
      <h2 style={h2S}>Tuzak Avı</h2>
      <p style={aS}>{M.tuzakAciklama}</p>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12.5, color: 'var(--sis)', margin: '6px 0' }}>
        Soru <b style={{ color: 'var(--ates)' }}>{idx + 1}/{sira.length}</b>
        {' · '}Doğru <b style={{ color: 'var(--ates)' }}>{dogru}</b>
        {' · '}Seri <b style={{ color: 'var(--ates)' }}>{seri}</b>
      </div>
      <div style={soruS}>
        <div style={{ fontSize: 15.5, fontWeight: 600, marginBottom: 12, whiteSpace: 'pre-line' }}>{soru.q}</div>
        {perm.map((oi, gp) => {
          let renk = 'var(--panel2)'
          let borderRenk = 'var(--cizgi)'
          let textRenk = 'var(--sut)'
          if (secili !== null) {
            if (gp === dogruGp) { renk = 'rgba(116,202,141,.16)'; borderRenk = 'var(--yesil)'; textRenk = 'var(--yesil)' }
            else if (gp === secili) { renk = 'rgba(239,109,109,.14)'; borderRenk = 'var(--kizil)'; textRenk = 'var(--kizil)' }
          }
          return (
            <button
              key={gp}
              disabled={secili !== null}
              onClick={() => sec(gp)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', textAlign: 'left', background: renk, border: `1px solid ${borderRenk}`, color: textRenk, borderRadius: 12, padding: '12px 14px', margin: '7px 0', fontSize: 14.5, fontWeight: 500, cursor: secili !== null ? 'default' : 'pointer', minHeight: 48 }}
            >
              <span style={{ ...tusS, borderColor: borderRenk, color: textRenk }}>{gp + 1}</span>
              <span>{soru.o[oi]}</span>
            </button>
          )
        })}
        {secili !== null && (
          <>
            <div style={{ borderLeft: '3px solid var(--gok)', background: 'rgba(95,205,196,.08)', padding: '10px 12px', borderRadius: '0 10px 10px 0', fontSize: 13.5, marginTop: 10, animation: 'gel .2s ease' }}>
              {soru.n}
            </div>
            <div style={{ marginTop: 10 }}>
              <button style={anaButonS} onClick={sonraki}>{idx === sira.length - 1 ? 'Bitir' : M.sonraki}</button>
            </div>
          </>
        )}
      </div>
      <p style={ipucuS}>{M.tuzakKlavye}</p>
    </section>
  )
}

const h2S: React.CSSProperties = { fontFamily: 'Sofia Sans Condensed, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', fontSize: 20, margin: '4px 0 2px' }
const aS: React.CSSProperties = { color: 'var(--sis)', fontSize: 13.5, margin: '0 0 14px' }
const ipucuS: React.CSSProperties = { color: 'var(--sis)', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', margin: '10px 2px 0', opacity: 0.75 }
const tusS: React.CSSProperties = { flex: '0 0 auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22, height: 22, borderRadius: 6, border: '1px solid var(--cizgi)', fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700 }
const soruS: React.CSSProperties = { background: 'var(--panel)', border: '1px solid var(--cizgi)', borderRadius: 16, padding: 16, margin: '10px 0', animation: 'gel .2s ease' }
const ozetS: React.CSSProperties = { background: 'var(--panel)', border: '1px solid var(--ates)', borderRadius: 16, padding: 18, margin: '12px 0' }
const buyukS: React.CSSProperties = { fontFamily: 'Sofia Sans Condensed, sans-serif', fontSize: 34, fontWeight: 800, color: 'var(--ates)' }
const butonS: React.CSSProperties = { display: 'inline-block', background: 'var(--panel2)', color: 'var(--sut)', border: '1px solid var(--cizgi)', borderRadius: 12, padding: '12px 16px', fontSize: 15, fontWeight: 600, cursor: 'pointer', minHeight: 48 }
const anaButonS: React.CSSProperties = { ...butonS, background: 'var(--ates)', borderColor: 'var(--ates)', color: '#20180c' }
