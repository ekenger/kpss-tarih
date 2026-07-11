import { useEffect, useState } from 'react'
import { useStore } from '../store'
import Nav from './Nav'
import GunSecici from '../features/gunler/GunSecici'
import Kodlar from '../features/kodlar/Kodlar'
import Kartlar from '../features/kartlar/Kartlar'
import Tuzak from '../features/tuzak/Tuzak'
import Deneme from '../features/deneme/Deneme'
import Eslestir from '../features/eslestir/Eslestir'
import type { Gun } from '../lib/schema'
import { loadGun } from '../lib/content'

export default function App() {
  const { aktifGun, aktifSekme } = useStore()
  const [gunData, setGunData] = useState<Gun | null>(null)
  const [yukleniyor, setYukleniyor] = useState(false)

  useEffect(() => {
    if (aktifGun === 0) { setGunData(null); return }
    setYukleniyor(true)
    loadGun(aktifGun)
      .then(setGunData)
      .finally(() => setYukleniyor(false))
  }, [aktifGun])

  if (aktifGun === 0) {
    return (
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 14px' }}>
        <GunSecici />
      </div>
    )
  }

  return (
    <>
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 14px' }}>
        <Header />
        {yukleniyor && (
          <p style={{ color: 'var(--sis)', padding: '40px 0', textAlign: 'center' }}>
            Yükleniyor…
          </p>
        )}
        {gunData && !yukleniyor && (
          <>
            {aktifSekme === 'kodlar'   && <Kodlar   gun={gunData} />}
            {aktifSekme === 'kartlar'  && <Kartlar  gun={gunData} />}
            {aktifSekme === 'tuzak'    && <Tuzak    gun={gunData} />}
            {aktifSekme === 'deneme'   && <Deneme   gun={gunData} />}
            {aktifSekme === 'eslestir' && <Eslestir gun={gunData} />}
          </>
        )}
      </div>
      <Nav />
    </>
  )
}

function Header() {
  const { aktifGun, setAktifGun } = useStore()
  return (
    <header style={{ borderBottom: '1px solid var(--cizgi)', padding: '16px 0 12px', marginBottom: 14 }}>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '.18em', color: 'var(--ates)', textTransform: 'uppercase' }}>
        30 Günde Tarih · Gün {aktifGun}
      </div>
      <button
        onClick={() => setAktifGun(0)}
        style={{ background: 'none', border: 'none', color: 'var(--sis)', fontSize: 13, cursor: 'pointer', padding: '4px 0' }}
      >
        ← Gün seçimine dön
      </button>
    </header>
  )
}
