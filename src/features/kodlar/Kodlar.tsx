import { useState } from 'react'
import type { Gun } from '../../lib/schema'
import { M } from '../../lib/metin'

interface Props { gun: Gun }

export default function Kodlar({ gun }: Props) {
  const [aciklar, setAciklar] = useState<Set<string>>(new Set())
  const [hepsiAcik, setHepsiAcik] = useState(false)

  function toggle(id: string) {
    setAciklar((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleHepsi() {
    const yeni = !hepsiAcik
    setHepsiAcik(yeni)
    if (yeni) {
      const tumIds = gun.kodlar.flatMap((g, gi) => g.i.map((_, ii) => `${gi}-${ii}`))
      setAciklar(new Set(tumIds))
    } else {
      setAciklar(new Set())
    }
  }

  return (
    <section>
      <h2 style={h2Style}>Kod Defteri</h2>
      <p style={aciklamaStyle}>{M.kodlarAciklama}</p>
      <button onClick={toggleHepsi} style={kucukButonStyle}>{M.hepsiniAc}</button>

      {gun.kodlar.map((grup, gi) => (
        <div key={gi}>
          <h3 style={h3Style}>{grup.b}</h3>
          {grup.i.map((item, ii) => {
            const id = `${gi}-${ii}`
            const acik = aciklar.has(id)
            return (
              <div
                key={ii}
                role="button"
                tabIndex={0}
                aria-expanded={acik}
                onClick={() => toggle(id)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(id) } }}
                style={{
                  background: 'var(--panel)',
                  border: '1px solid var(--cizgi)',
                  borderRadius: '6px 16px 6px 16px',
                  padding: '11px 13px',
                  margin: '8px 0',
                  cursor: 'pointer',
                }}
              >
                <span style={{
                  float: 'right',
                  fontSize: 10,
                  fontFamily: 'JetBrains Mono, monospace',
                  color: item.s === 'z' ? 'var(--ates)' : 'var(--gok)',
                  border: '1px solid var(--cizgi)',
                  borderRadius: 99,
                  padding: '1px 7px',
                  marginLeft: 8,
                }}>
                  {item.s === 'z' ? 'Z' : '+'}
                </span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, color: 'var(--gok)', fontSize: 14.5 }}>
                  {item.k}
                </span>
                {acik && (
                  <div style={{
                    marginTop: 8, paddingTop: 8,
                    borderTop: '1px dashed var(--cizgi)',
                    fontSize: 14.5,
                    animation: 'gel .18s ease',
                  }}>
                    {item.m}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </section>
  )
}

const h2Style: React.CSSProperties = {
  fontFamily: 'Sofia Sans Condensed, sans-serif',
  fontWeight: 800,
  textTransform: 'uppercase',
  letterSpacing: '.06em',
  fontSize: 20,
  margin: '4px 0 2px',
}
const aciklamaStyle: React.CSSProperties = { color: 'var(--sis)', fontSize: 13.5, margin: '0 0 14px' }
const h3Style: React.CSSProperties = {
  fontFamily: 'Sofia Sans Condensed, sans-serif',
  letterSpacing: '.05em',
  textTransform: 'uppercase',
  fontSize: 15,
  color: 'var(--ates)',
  margin: '20px 0 8px',
  borderLeft: '3px solid var(--ates)',
  paddingLeft: 8,
}
const kucukButonStyle: React.CSSProperties = {
  display: 'inline-block',
  background: 'var(--panel2)',
  color: 'var(--sut)',
  border: '1px solid var(--cizgi)',
  borderRadius: 99,
  padding: '8px 12px',
  fontSize: 13.5,
  fontWeight: 600,
  cursor: 'pointer',
  minHeight: 40,
  marginBottom: 8,
}
