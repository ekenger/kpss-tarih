import { useState, useCallback } from 'react'
import type { Gun } from '../../lib/schema'
import { M } from '../../lib/metin'
import { karistir } from '../../lib/skor'

interface Props { gun: Gun }

type Durum = 'soru' | 'bitti'

export default function Tuzak({ gun }: Props) {
  const [sira, setSira] = useState<number[]>(() => karistir(gun.tuzak.map((_, i) => i)))
  const [idx, setIdx] = useState(0)
  const [dogru, setDogru] = useState(0)
  const [seri, setSeri] = useState(0)
  const [yanlisList, setYanlisList] = useState<number[]>([])
  const [secili, setSecili] = useState<number | null>(null)
  const [durum, setDurum] = useState<Durum>('soru')

  const baslat = useCallback((liste?: number[]) => {
    setSira(liste ? liste.slice() : karistir(gun.tuzak.map((_, i) => i)))
    setIdx(0); setDogru(0); setSeri(0); setYanlisList([]); setSecili(null); setDurum('soru')
  }, [gun.tuzak])

  function sec(secIdx: number) {
    if (secili !== null) return
    const soru = gun.tuzak[sira[idx]]
    const dogруmu = secIdx === soru.c
    setSecili(secIdx)
    if (dogруmu) { setDogru((d) => d + 1); setSeri((s) => s + 1) }
    else { setYanlisList((y) => [...y, sira[idx]]); setSeri(0) }
  }

  function sonraki() {
    if (idx + 1 >= sira.length) { setDurum('bitti'); return }
    setIdx(idx + 1); setSecili(null)
  }

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

  const soru = gun.tuzak[sira[idx]]
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
        {soru.o.map((o, i) => {
          let renk = 'var(--panel2)'
          let borderRenk = 'var(--cizgi)'
          let textRenk = 'var(--sut)'
          if (secili !== null) {
            if (i === soru.c) { renk = 'rgba(116,202,141,.16)'; borderRenk = 'var(--yesil)'; textRenk = 'var(--yesil)' }
            else if (i === secili) { renk = 'rgba(239,109,109,.14)'; borderRenk = 'var(--kizil)'; textRenk = 'var(--kizil)' }
          }
          return (
            <button
              key={i}
              disabled={secili !== null}
              onClick={() => sec(i)}
              style={{ display: 'block', width: '100%', textAlign: 'left', background: renk, border: `1px solid ${borderRenk}`, color: textRenk, borderRadius: 12, padding: '12px 14px', margin: '7px 0', fontSize: 14.5, fontWeight: 500, cursor: secili !== null ? 'default' : 'pointer', minHeight: 48 }}
            >
              {o}
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
    </section>
  )
}

const h2S: React.CSSProperties = { fontFamily: 'Sofia Sans Condensed, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', fontSize: 20, margin: '4px 0 2px' }
const aS: React.CSSProperties = { color: 'var(--sis)', fontSize: 13.5, margin: '0 0 14px' }
const soruS: React.CSSProperties = { background: 'var(--panel)', border: '1px solid var(--cizgi)', borderRadius: 16, padding: 16, margin: '10px 0', animation: 'gel .2s ease' }
const ozetS: React.CSSProperties = { background: 'var(--panel)', border: '1px solid var(--ates)', borderRadius: 16, padding: 18, margin: '12px 0' }
const buyukS: React.CSSProperties = { fontFamily: 'Sofia Sans Condensed, sans-serif', fontSize: 34, fontWeight: 800, color: 'var(--ates)' }
const butonS: React.CSSProperties = { display: 'inline-block', background: 'var(--panel2)', color: 'var(--sut)', border: '1px solid var(--cizgi)', borderRadius: 12, padding: '12px 16px', fontSize: 15, fontWeight: 600, cursor: 'pointer', minHeight: 48 }
const anaButonS: React.CSSProperties = { ...butonS, background: 'var(--ates)', borderColor: 'var(--ates)', color: '#20180c' }
