import { useEffect, useState } from 'react'
import { useStore, type Modul } from '../../store'
import type { Gun } from '../../lib/schema'
import { loadGun } from '../../lib/content'
import { IkonGeri } from '../../app/ikonlar'
import Kodlar from '../kodlar/Kodlar'
import Kartlar from '../kartlar/Kartlar'
import Tuzak from '../tuzak/Tuzak'
import Deneme from '../deneme/Deneme'
import Eslestir from '../eslestir/Eslestir'

const moduller: { id: Modul; etiket: string }[] = [
  { id: 'kodlar',   etiket: 'Kodlar'   },
  { id: 'kartlar',  etiket: 'Kartlar'  },
  { id: 'tuzak',    etiket: 'Tuzak'    },
  { id: 'deneme',   etiket: 'Deneme'   },
  { id: 'eslestir', etiket: 'Eşleştir' },
]

export default function GunDetay() {
  const { aktifGun, aktifModul, setAktifModul, gunlereDon } = useStore()
  const [gun, setGun] = useState<Gun | null>(null)

  useEffect(() => {
    let iptal = false
    setGun(null)
    loadGun(aktifGun).then((g) => { if (!iptal) setGun(g) })
    return () => { iptal = true }
  }, [aktifGun])

  return (
    <div>
      {/* Sticky başlık + segmented modül çubuğu */}
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'linear-gradient(var(--gece) 74%, transparent)', margin: '0 -14px', padding: '12px 14px 10px' }}>
        <button onClick={gunlereDon} style={geriS}>
          <IkonGeri size={17} /> Günler
        </button>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, margin: '6px 0 12px' }}>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 700, color: 'var(--ates)', letterSpacing: '.06em' }}>
            GÜN {aktifGun}
          </span>
          <h1 style={baslikS}>{gun ? gun.meta.baslik : '…'}</h1>
        </div>

        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2, WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
          {moduller.map((m) => {
            const aktif = aktifModul === m.id
            return (
              <button
                key={m.id}
                onClick={() => setAktifModul(m.id)}
                aria-current={aktif ? 'page' : undefined}
                style={{
                  flexShrink: 0,
                  background: aktif ? 'var(--sut)' : 'var(--panel2)',
                  color: aktif ? '#1a232f' : 'var(--sis)',
                  border: '1px solid ' + (aktif ? 'var(--sut)' : 'var(--cizgi)'),
                  borderRadius: 99, padding: '8px 15px',
                  font: '700 13.5px Manrope, sans-serif',
                  cursor: 'pointer', minHeight: 40,
                  transition: 'background .15s, color .15s',
                }}
              >
                {m.etiket}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ animation: 'gel .2s ease' }}>
        {!gun ? (
          <p style={{ color: 'var(--sis)', padding: '40px 0', textAlign: 'center' }}>Yükleniyor…</p>
        ) : (
          <>
            {aktifModul === 'kodlar'   && <Kodlar   gun={gun} />}
            {aktifModul === 'kartlar'  && <Kartlar  gun={gun} />}
            {aktifModul === 'tuzak'    && <Tuzak    gun={gun} />}
            {aktifModul === 'deneme'   && <Deneme   gun={gun} />}
            {aktifModul === 'eslestir' && <Eslestir gun={gun} />}
          </>
        )}
      </div>
    </div>
  )
}

const geriS: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: 5,
  background: 'none', border: 'none', color: 'var(--sis)',
  fontSize: 13.5, fontWeight: 600, cursor: 'pointer', padding: '2px 0',
}
const baslikS: React.CSSProperties = {
  fontFamily: 'Sofia Sans Condensed, sans-serif', fontWeight: 800,
  fontSize: 22, margin: 0, lineHeight: 1.1, textWrap: 'balance',
}
