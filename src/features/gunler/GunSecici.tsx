import { useEffect, useState } from 'react'
import { useStore } from '../../store'
import { loadIndex, type GunIndex } from '../../lib/content'
import { srsGunOzetleri, type GunOzet } from '../../lib/ilerleme'
import { M } from '../../lib/metin'
import { IkonKilit, IkonTik } from '../../app/ikonlar'

export default function GunSecici() {
  const { setAktifGun } = useStore()
  const [liste, setListe] = useState<GunIndex[]>([])
  const [ozet, setOzet] = useState<Record<number, GunOzet>>({})

  useEffect(() => {
    loadIndex().then(setListe)
    setOzet(srsGunOzetleri())
  }, [])

  const hazirlar = liste.filter((g) => g.hazir)
  const baslanan = hazirlar.filter((g) => ozet[g.gun]?.adet > 0).length

  return (
    <section style={{ paddingTop: 4 }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
        <div>
          <h2 style={h2S}>Günler</h2>
          <p style={aS}>{M.gunlerAciklama}</p>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div className="tnum" style={{ fontFamily: 'Sofia Sans Condensed, sans-serif', fontWeight: 800, fontSize: 26, color: 'var(--gok)', lineHeight: 1 }}>
            {baslanan}<span style={{ color: 'var(--sis2)', fontSize: 16 }}>/{hazirlar.length}</span>
          </div>
          <div style={{ fontSize: 10.5, color: 'var(--sis2)', letterSpacing: '.06em', textTransform: 'uppercase' }}>başlanan</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
        {liste.map((g) => {
          const o = ozet[g.gun]
          const oran = o && o.adet ? o.ort / 5 : 0
          const tamam = o && o.adet > 0 && o.kutu5 === o.adet
          return (
            <button
              key={g.gun}
              disabled={!g.hazir}
              onClick={() => setAktifGun(g.gun)}
              style={{
                position: 'relative',
                display: 'flex', flexDirection: 'column', gap: 8,
                background: g.hazir ? 'var(--panel)' : 'var(--gece2)',
                border: `1px solid ${tamam ? 'var(--yesil)' : g.hazir ? 'var(--cizgi)' : 'var(--cizgi)'}`,
                borderRadius: 16,
                padding: '13px 14px 14px',
                textAlign: 'left',
                cursor: g.hazir ? 'pointer' : 'not-allowed',
                opacity: g.hazir ? 1 : 0.55,
                color: 'var(--sut)',
                boxShadow: g.hazir ? 'var(--golge-1)' : 'none',
                transition: 'transform .12s, border-color .15s',
                minHeight: 118,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="tnum" style={{
                  display: 'grid', placeItems: 'center', width: 30, height: 30, borderRadius: 9,
                  background: g.hazir ? 'var(--panel2)' : 'transparent',
                  border: '1px solid var(--cizgi)',
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700,
                  color: g.hazir ? 'var(--ates)' : 'var(--sis2)',
                }}>{g.gun}</span>
                {!g.hazir
                  ? <span style={{ color: 'var(--sis2)' }}><IkonKilit /></span>
                  : tamam
                    ? <span style={{ display: 'grid', placeItems: 'center', width: 22, height: 22, borderRadius: 99, background: 'var(--yesil)', color: '#12251a' }}><IkonTik /></span>
                    : o && o.adet > 0
                      ? <span className="tnum" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'var(--gok)', fontWeight: 700 }}>%{Math.round(oran * 100)}</span>
                      : null}
              </div>

              <div style={{ fontSize: 13.5, fontWeight: 600, lineHeight: 1.28, flexGrow: 1 }}>{g.baslik}</div>

              {!g.hazir ? (
                <span style={{ fontSize: 11, color: 'var(--sis2)', letterSpacing: '.04em' }}>{M.yakinda}</span>
              ) : o && o.adet > 0 ? (
                <div style={{ height: 4, background: 'var(--panel2)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${oran * 100}%`, background: tamam ? 'var(--yesil)' : 'var(--grad-gok)', transition: 'width .3s' }} />
                </div>
              ) : (
                <span style={{ fontSize: 11, color: 'var(--sis2)' }}>{M.baslanmadi}</span>
              )}
            </button>
          )
        })}
      </div>
    </section>
  )
}

const h2S: React.CSSProperties = { fontFamily: 'Sofia Sans Condensed, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.05em', fontSize: 24, margin: '0 0 2px' }
const aS: React.CSSProperties = { color: 'var(--sis)', fontSize: 13, margin: 0 }
