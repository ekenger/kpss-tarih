import { useStore } from '../store'
import Nav from './Nav'
import GunSecici from '../features/gunler/GunSecici'
import GunDetay from '../features/gunler/GunDetay'
import Bugun from '../features/bugun/Bugun'
import Ilerleme from '../features/ilerleme/Ilerleme'

export default function App() {
  const { anaSekme, aktifGun } = useStore()

  return (
    <>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 14px', minHeight: '70vh' }}>
        {aktifGun > 0 ? (
          <GunDetay />
        ) : (
          <>
            <MarkaBaslik />
            <div key={anaSekme} style={{ animation: 'gel .22s ease' }}>
              {anaSekme === 'bugun' && <Bugun />}
              {anaSekme === 'gunler' && <GunSecici />}
              {anaSekme === 'ilerleme' && <Ilerleme />}
            </div>
          </>
        )}
      </div>
      <Nav />
    </>
  )
}

function MarkaBaslik() {
  return (
    <header style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '18px 2px 10px' }}>
      <span aria-hidden style={{
        width: 30, height: 30, borderRadius: 9, display: 'grid', placeItems: 'center',
        background: 'var(--grad-ates)', color: '#231607', fontFamily: 'Sofia Sans Condensed, sans-serif',
        fontWeight: 800, fontSize: 17, boxShadow: 'var(--golge-1)',
      }}>T</span>
      <div style={{ lineHeight: 1.05 }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: '.22em', color: 'var(--sis2)' }}>KPSS · 30 GÜN</div>
        <div style={{ fontFamily: 'Sofia Sans Condensed, sans-serif', fontWeight: 800, fontSize: 18, letterSpacing: '.01em' }}>Tarih Kampı</div>
      </div>
    </header>
  )
}
