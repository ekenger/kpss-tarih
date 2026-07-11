import { useStore, type Sekme } from '../store'

const sekmeler: { id: Sekme; ikon: string; etiket: string }[] = [
  { id: 'kodlar',   ikon: '🧿', etiket: 'Kodlar'   },
  { id: 'kartlar',  ikon: '🃏', etiket: 'Kartlar'  },
  { id: 'tuzak',    ikon: '⚔️', etiket: 'Tuzak'    },
  { id: 'deneme',   ikon: '📝', etiket: 'Deneme'   },
  { id: 'eslestir', ikon: '🧩', etiket: 'Eşleştir' },
]

export default function Nav() {
  const { aktifSekme, setAktifSekme } = useStore()

  return (
    <nav
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(28,37,49,.97)',
        borderTop: '1px solid var(--cizgi)',
        display: 'flex',
        paddingBottom: 'env(safe-area-inset-bottom)',
        backdropFilter: 'blur(8px)',
        zIndex: 50,
      }}
    >
      {sekmeler.map((s) => {
        const aktif = aktifSekme === s.id
        return (
          <button
            key={s.id}
            onClick={() => setAktifSekme(s.id)}
            aria-current={aktif ? 'page' : undefined}
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              borderTop: `2px solid ${aktif ? 'var(--ates)' : 'transparent'}`,
              color: aktif ? 'var(--ates)' : 'var(--sis)',
              font: '600 11px Manrope, sans-serif',
              padding: '9px 2px 10px',
              cursor: 'pointer',
              minHeight: 58,
            }}
          >
            <span style={{ display: 'block', fontSize: 19, marginBottom: 3 }}>{s.ikon}</span>
            {s.etiket}
          </button>
        )
      })}
    </nav>
  )
}
