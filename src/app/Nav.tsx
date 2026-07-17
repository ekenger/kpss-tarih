import { useStore, type AnaSekme } from '../store'
import { IkonBugun, IkonGunler, IkonIlerleme } from './ikonlar'

const sekmeler: { id: AnaSekme; etiket: string; Ikon: (p: { size?: number }) => JSX.Element }[] = [
  { id: 'bugun',    etiket: 'Bugün',    Ikon: IkonBugun },
  { id: 'gunler',   etiket: 'Günler',   Ikon: IkonGunler },
  { id: 'ilerleme', etiket: 'İlerleme', Ikon: IkonIlerleme },
]

export default function Nav() {
  const { anaSekme, aktifGun, setAnaSekme } = useStore()
  // Bir güne girildiğinde bağlamsal olarak "Günler" etkin görünür.
  const etkin: AnaSekme = aktifGun > 0 ? 'gunler' : anaSekme

  return (
    <nav
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(21, 29, 39, .82)',
        borderTop: '1px solid var(--cizgi)',
        display: 'flex', justifyContent: 'center', gap: 4,
        padding: '8px 10px calc(8px + env(safe-area-inset-bottom))',
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
        zIndex: 50,
      }}
    >
      {sekmeler.map(({ id, etiket, Ikon }) => {
        const aktif = etkin === id
        return (
          <button
            key={id}
            onClick={() => setAnaSekme(id)}
            aria-current={aktif ? 'page' : undefined}
            style={{
              flex: '1 1 0', maxWidth: 160,
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              background: aktif ? 'rgba(255, 162, 70, .12)' : 'transparent',
              border: '1px solid ' + (aktif ? 'rgba(255,162,70,.28)' : 'transparent'),
              borderRadius: 14,
              color: aktif ? 'var(--ates)' : 'var(--sis)',
              font: '700 11px Manrope, sans-serif',
              letterSpacing: '.02em',
              padding: '7px 2px 6px',
              cursor: 'pointer',
              transition: 'color .18s, background .18s, border-color .18s',
            }}
          >
            <Ikon size={21} />
            {etiket}
          </button>
        )
      })}
    </nav>
  )
}
