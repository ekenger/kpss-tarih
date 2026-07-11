import { useState, useCallback } from 'react'
import type { Gun } from '../../lib/schema'
import { M } from '../../lib/metin'
import { karistir } from '../../lib/skor'

interface Props { gun: Gun }

interface Kart { pairIdx: number; text: string; uid: string }

export default function Eslestir({ gun }: Props) {
  const [setIdx, setSetIdx] = useState(0)
  const [kartlar, setKartlar] = useState<Kart[]>(() => buildKartlar(gun.eslestir[0]))
  const [secili, setSecili] = useState<string | null>(null)
  const [eslesmis, setEslesmis] = useState<Set<string>>(new Set())
  const [sallayanlar, setSallayanlar] = useState<Set<string>>(new Set())

  const setDegistir = useCallback((idx: number) => {
    setSetIdx(idx)
    setKartlar(buildKartlar(gun.eslestir[idx]))
    setSecili(null)
    setEslesmis(new Set())
    setSallayanlar(new Set())
  }, [gun.eslestir])

  function tikla(uid: string, pairIdx: number) {
    if (eslesmis.has(uid)) return
    if (!secili) { setSecili(uid); return }
    if (secili === uid) { setSecili(null); return }

    const seciliKart = kartlar.find((k) => k.uid === secili)!
    if (seciliKart.pairIdx === pairIdx) {
      // Eşleşti
      setEslesmis((prev) => new Set([...prev, secili, uid]))
      setSecili(null)
    } else {
      // Hata — salla
      const s = new Set([secili, uid])
      setSallayanlar(s)
      setSecili(null)
      setTimeout(() => setSallayanlar(new Set()), 350)
    }
  }

  const aktifSet = gun.eslestir[setIdx]
  const toplamCift = aktifSet.p.length
  const bulunan = eslesmis.size / 2

  return (
    <section>
      <h2 style={h2S}>Eşleştir</h2>
      <p style={aS}>{M.eslestirAciklama}</p>

      {/* Set seçici */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '4px 0 10px', WebkitOverflowScrolling: 'touch' }}>
        {gun.eslestir.map((s, i) => (
          <button
            key={i}
            onClick={() => setDegistir(i)}
            style={{ ...chipS, background: i === setIdx ? 'var(--gok)' : 'var(--panel2)', borderColor: i === setIdx ? 'var(--gok)' : 'var(--cizgi)', color: i === setIdx ? '#0d2422' : 'var(--sut)', flexShrink: 0 }}
          >
            {s.ad}
          </button>
        ))}
      </div>

      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12.5, color: 'var(--sis)', margin: '6px 0' }}>
        {bulunan === toplamCift ? M.setBitti : M.eslenme(bulunan, toplamCift)}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
        {kartlar.map((k) => {
          const eslesdi = eslesmis.has(k.uid)
          const seciili = secili === k.uid
          const sallayan = sallayanlar.has(k.uid)
          return (
            <button
              key={k.uid}
              onClick={() => tikla(k.uid, k.pairIdx)}
              disabled={eslesdi}
              style={{
                background: 'var(--panel2)',
                border: `1px solid ${eslesdi ? 'var(--yesil)' : seciili ? 'var(--gok)' : 'var(--cizgi)'}`,
                borderRadius: 12,
                minHeight: 64,
                padding: 10,
                fontSize: 13.5,
                fontWeight: 600,
                cursor: eslesdi ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                color: eslesdi ? 'var(--yesil)' : seciili ? 'var(--gok)' : 'var(--sut)',
                opacity: eslesdi ? 0.45 : 1,
                animation: sallayan ? 'salla .3s ease' : undefined,
              }}
            >
              {k.text}
            </button>
          )
        })}
      </div>
    </section>
  )
}

function buildKartlar(set: Gun['eslestir'][number]): Kart[] {
  const kartlar: Kart[] = []
  set.p.forEach(([sol, sag], pi) => {
    kartlar.push({ pairIdx: pi, text: sol, uid: `${pi}-0` })
    kartlar.push({ pairIdx: pi, text: sag, uid: `${pi}-1` })
  })
  return karistir(kartlar)
}

const h2S: React.CSSProperties = { fontFamily: 'Sofia Sans Condensed, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', fontSize: 20, margin: '4px 0 2px' }
const aS: React.CSSProperties = { color: 'var(--sis)', fontSize: 13.5, margin: '0 0 14px' }
const chipS: React.CSSProperties = { border: '1px solid', borderRadius: 99, padding: '8px 12px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', minHeight: 40 }
