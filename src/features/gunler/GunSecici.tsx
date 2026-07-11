import { useEffect, useState } from 'react'
import { useStore } from '../../store'
import { loadIndex, type GunIndex } from '../../lib/content'
import { M } from '../../lib/metin'

export default function GunSecici() {
  const { setAktifGun } = useStore()
  const [liste, setListe] = useState<GunIndex[]>([])

  useEffect(() => { loadIndex().then(setListe) }, [])

  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '.18em', color: 'var(--ates)', textTransform: 'uppercase', marginBottom: 8 }}>
        30 Günde Tarih
      </div>
      <h1 style={{ fontFamily: 'Sofia Sans Condensed, Manrope, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', fontSize: 'clamp(24px,6vw,34px)', margin: '4px 0 20px', lineHeight: 1.05 }}>
        Gün Seçin
      </h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
        {liste.map((g) => (
          <button
            key={g.gun}
            disabled={!g.hazir}
            onClick={() => setAktifGun(g.gun)}
            style={{
              background: 'var(--panel)',
              border: `1px solid ${g.hazir ? 'var(--cizgi)' : 'var(--panel2)'}`,
              borderRadius: 12,
              padding: '14px 16px',
              textAlign: 'left',
              cursor: g.hazir ? 'pointer' : 'default',
              opacity: g.hazir ? 1 : 0.5,
              color: 'var(--sut)',
            }}
          >
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--ates)', marginBottom: 4 }}>
              GÜN {g.gun}
            </div>
            <div style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.3 }}>{g.baslik}</div>
            {!g.hazir && (
              <span style={{ display: 'inline-block', marginTop: 6, fontSize: 11, background: 'var(--panel2)', color: 'var(--sis)', borderRadius: 99, padding: '2px 8px' }}>
                {M.yakinda}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
