/** Hazırlık skoru için inline SVG ilerleme halkası (harici kütüphane yok). */
interface Props {
  /** 0–100. */
  yuzde: number
  boyut?: number
  /** Merkezde gösterilecek metin (varsayılan: %yuzde). null → boş. */
  etiket?: string | null
  renk?: string
}

export default function HazirlikHalka({ yuzde, boyut = 96, etiket, renk = 'var(--ates)' }: Props) {
  const kalinlik = Math.max(6, boyut * 0.09)
  const r = (boyut - kalinlik) / 2
  const cevre = 2 * Math.PI * r
  const dolu = Math.max(0, Math.min(100, yuzde)) / 100
  const merkez = etiket === undefined ? `%${Math.round(yuzde)}` : etiket

  return (
    <div style={{ position: 'relative', width: boyut, height: boyut, flexShrink: 0 }}>
      <svg width={boyut} height={boyut} viewBox={`0 0 ${boyut} ${boyut}`} role="img" aria-label={`Hazırlık %${Math.round(yuzde)}`}>
        <circle cx={boyut / 2} cy={boyut / 2} r={r} fill="none" stroke="var(--panel2)" strokeWidth={kalinlik} />
        <circle
          cx={boyut / 2} cy={boyut / 2} r={r} fill="none" stroke={renk} strokeWidth={kalinlik}
          strokeLinecap="round" strokeDasharray={cevre} strokeDashoffset={cevre * (1 - dolu)}
          transform={`rotate(-90 ${boyut / 2} ${boyut / 2})`}
          style={{ transition: 'stroke-dashoffset .6s ease' }}
        />
      </svg>
      {merkez !== null && (
        <div className="tnum" style={{
          position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
          fontFamily: 'Sofia Sans Condensed, sans-serif', fontWeight: 800,
          fontSize: boyut * 0.28, color: renk, lineHeight: 1,
        }}>{merkez}</div>
      )}
    </div>
  )
}
