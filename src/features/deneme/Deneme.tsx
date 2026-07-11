import { useState, useCallback } from 'react'
import type { Gun } from '../../lib/schema'
import { M } from '../../lib/metin'
import { hesaplaNet } from '../../lib/skor'

interface Props { gun: Gun }

const HARF = ['A', 'B', 'C', 'D', 'E'] as const

export default function Deneme({ gun }: Props) {
  const [sira] = useState<number[]>(() => gun.deneme.map((_, i) => i))
  const [idx, setIdx] = useState(0)
  const [dogru, setDogru] = useState(0)
  const [yanlis, setYanlis] = useState(0)
  const [yanlisList, setYanlisList] = useState<number[]>([])
  const [secili, setSecili] = useState<number | null>(null)
  const [bitti, setBitti] = useState(false)
  const [kopyalandi, setKopyalandi] = useState(false)

  const [tekrarSira, setTekrarSira] = useState<number[] | null>(null)
  const aktifSira = tekrarSira ?? sira

  const bastan = useCallback(() => {
    setIdx(0); setDogru(0); setYanlis(0); setYanlisList([]); setSecili(null); setBitti(false); setTekrarSira(null)
  }, [])

  function sec(secIdx: number) {
    if (secili !== null) return
    const soru = gun.deneme[aktifSira[idx]]
    setSecili(secIdx)
    if (secIdx === soru.c) setDogru((d) => d + 1)
    else { setYanlis((y) => y + 1); setYanlisList((l) => [...l, aktifSira[idx]]) }
  }

  function sonraki() {
    if (idx + 1 >= aktifSira.length) { setBitti(true); return }
    setIdx(idx + 1); setSecili(null)
  }

  function yanlislariCoz() {
    setTekrarSira(yanlisList.slice())
    setIdx(0); setDogru(0); setYanlis(0); setYanlisList([]); setSecili(null); setBitti(false)
  }

  async function kopyala() {
    const net = hesaplaNet(dogru, yanlis).toFixed(2)
    const metin = M.kopya(gun.meta.gun, dogru, yanlis, net)
    try { await navigator.clipboard.writeText(metin) } catch { /* ignore */ }
    setKopyalandi(true)
    setTimeout(() => setKopyalandi(false), 2000)
  }

  if (bitti) {
    const net = hesaplaNet(dogru, yanlis).toFixed(2)
    return (
      <section>
        <h2 style={h2S}>Deneme · {aktifSira.length} Soru</h2>
        <div style={ozetS}>
          <div style={buyukS}>Net: {net}</div>
          <div>Doğru {dogru} · Yanlış {yanlis}</div>
          <div style={{ marginTop: 8, fontSize: 13.5 }}>
            <b>{M.kopya(gun.meta.gun, dogru, yanlis, net)}</b>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
            <button style={anaButonS} onClick={kopyala}>
              {kopyalandi ? M.kopyalandı : 'Kopyala'}
            </button>
            {yanlisList.length > 0 && (
              <button style={anaButonS} onClick={yanlislariCoz}>{M.yanlislariCoz}</button>
            )}
            <button style={butonS} onClick={bastan}>{M.bastan}</button>
          </div>
        </div>
      </section>
    )
  }

  const soru = gun.deneme[aktifSira[idx]]
  return (
    <section>
      <h2 style={h2S}>Deneme · {aktifSira.length} Soru</h2>
      <p style={aS}>{M.denemeAciklama}</p>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12.5, color: 'var(--sis)', margin: '6px 0' }}>
        Soru <b style={{ color: 'var(--ates)' }}>{idx + 1}/{aktifSira.length}</b>
        {' · '}D: <b style={{ color: 'var(--ates)' }}>{dogru}</b>
        {' · '}Y: <b style={{ color: 'var(--ates)' }}>{yanlis}</b>
      </div>
      <div style={soruS}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--ates)', letterSpacing: '.12em', marginBottom: 6 }}>
          SORU {aktifSira[idx] + 1}
        </div>
        <div style={{ fontSize: 15.5, fontWeight: 600, marginBottom: 12, whiteSpace: 'pre-line' }}>{soru.q}</div>
        {soru.o.map((o, i) => {
          let bg = 'var(--panel2)', border = 'var(--cizgi)', color = 'var(--sut)'
          if (secili !== null) {
            if (i === soru.c) { bg = 'rgba(116,202,141,.16)'; border = 'var(--yesil)'; color = 'var(--yesil)' }
            else if (i === secili) { bg = 'rgba(239,109,109,.14)'; border = 'var(--kizil)'; color = 'var(--kizil)' }
          }
          return (
            <button
              key={i}
              disabled={secili !== null}
              onClick={() => sec(i)}
              style={{ display: 'block', width: '100%', textAlign: 'left', background: bg, border: `1px solid ${border}`, color, borderRadius: 12, padding: '12px 14px', margin: '7px 0', fontSize: 14.5, fontWeight: 500, cursor: secili !== null ? 'default' : 'pointer', minHeight: 48 }}
            >
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
              <button style={anaButonS} onClick={sonraki}>
                {idx === aktifSira.length - 1 ? M.bitir : M.sonraki}
              </button>
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
