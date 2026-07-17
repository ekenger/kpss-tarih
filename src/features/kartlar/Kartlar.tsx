import { useState, useCallback, useEffect } from 'react'
import type { Gun } from '../../lib/schema'
import { M } from '../../lib/metin'
import { getZayifKartlar, setZayifKartlar } from '../../lib/storage'
import { karistir } from '../../lib/skor'
import { kartKimlik } from '../../lib/kimlik'
import { ilkDurum, derecelendir, type SrsState } from '../../lib/srs'
import { tumSrs, srsKaydet, srsSeedEt, seriGuncelle } from '../../lib/ilerleme'

interface Props { gun: Gun }

export default function Kartlar({ gun }: Props) {
  const gunNo = gun.meta.gun
  const kategoriler = ['Tümü', 'Zayıflar', ...Array.from(new Set(gun.kartlar.map((k) => k.c)))]
  // Kart başına kararlı kimlik (dizi sırası değişse de sabit).
  const kimlikler = gun.kartlar.map((k) => kartKimlik(gunNo, k))

  const [aktifKat, setAktifKat] = useState('Tümü')
  const [zayiflar, setZayiflar] = useState<number[]>(() => getZayifKartlar(gunNo))
  const [srsler, setSrsler] = useState<Record<string, SrsState>>(() => tumSrs())
  const [sira, setSira] = useState<number[]>([])
  const [idx, setIdx] = useState(0)
  const [arka, setArka] = useState(false)

  // Eski zayıf-kart verisini (indeks tabanlı) SRS'e taşı — sadece ilk kez, gün başına.
  useEffect(() => {
    const tohum = getZayifKartlar(gunNo).map((i) => ({ kimlik: kimlikler[i], gun: gunNo, tur: 'kart' as const }))
    if (tohum.length) { srsSeedEt(tohum, new Date()); setSrsler(tumSrs()) }
  }, [gunNo]) // eslint-disable-line react-hooks/exhaustive-deps

  const baslat = useCallback((kat: string, mevZayif: number[]) => {
    let indeksler = gun.kartlar.map((_, i) => i)
    if (kat === 'Zayıflar') indeksler = indeksler.filter((i) => mevZayif.includes(i))
    else if (kat !== 'Tümü') indeksler = indeksler.filter((i) => gun.kartlar[i].c === kat)
    setSira(karistir(indeksler))
    setIdx(0)
    setArka(false)
  }, [gun.kartlar])

  useEffect(() => { baslat(aktifKat, zayiflar) }, [aktifKat]) // eslint-disable-line react-hooks/exhaustive-deps

  function sonraki(bildi: boolean) {
    if (!sira.length || !arka) return
    const kartId = sira[idx]
    const yeniZayif = bildi
      ? zayiflar.filter((x) => x !== kartId)
      : zayiflar.includes(kartId) ? zayiflar : [...zayiflar, kartId]
    setZayiflar(yeniZayif)
    setZayifKartlar(gunNo, yeniZayif)

    // SRS: Leitner kutusunu ilerlet + seriyi güncelle.
    const now = new Date()
    const kim = kimlikler[kartId]
    const mevcut = srsler[kim] ?? ilkDurum(kim, gunNo, 'kart', now)
    const yeni = derecelendir(mevcut, bildi, now)
    srsKaydet(yeni)
    setSrsler((s) => ({ ...s, [kim]: yeni }))
    seriGuncelle(now)

    setArka(false)
    if (idx < sira.length - 1) { setIdx(idx + 1) }
    else { baslat(aktifKat, yeniZayif) }
  }

  const kart = sira.length ? gun.kartlar[sira[idx]] : null
  const kutu = kart ? srsler[kimlikler[sira[idx]]]?.kutu : undefined
  const ilerleme = sira.length ? ((idx + 1) / sira.length) * 100 : 0

  return (
    <section>
      <h2 style={h2S}>Kartlar</h2>
      <p style={aS}>{M.kartlarAciklama}</p>

      {/* Kategori filtreleri */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '4px 0 10px', WebkitOverflowScrolling: 'touch' }}>
        {kategoriler.map((kat) => (
          <button
            key={kat}
            onClick={() => setAktifKat(kat)}
            style={{
              ...chipS,
              background: aktifKat === kat ? 'var(--gok)' : 'var(--panel2)',
              borderColor: aktifKat === kat ? 'var(--gok)' : 'var(--cizgi)',
              color: aktifKat === kat ? '#0d2422' : 'var(--sut)',
              flexShrink: 0,
            }}
          >
            {kat}
            {kat === 'Zayıflar' && zayiflar.length > 0 && (
              <span style={{ marginLeft: 6, background: 'var(--kizil)', color: '#fff', borderRadius: 99, fontSize: 11, fontFamily: 'JetBrains Mono, monospace', padding: '1px 6px', fontWeight: 700 }}>
                {zayiflar.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* İlerleme */}
      <div style={{ height: 5, background: 'var(--panel2)', borderRadius: 99, overflow: 'hidden', margin: '8px 0 12px' }}>
        <div style={{ height: '100%', background: 'var(--gok)', width: `${ilerleme}%`, transition: 'width .3s' }} />
      </div>
      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12.5, color: 'var(--sis)', margin: '6px 0' }}>
        {sira.length > 0 ? `${idx + 1} / ${sira.length}  ·  zayıf: ${zayiflar.length}` : ''}
      </div>

      {/* Kart */}
      {!kart ? (
        <div style={kartS}>
          <div style={{ fontSize: 17, fontWeight: 600 }}>
            {aktifKat === 'Zayıflar' ? M.zayifYok : M.kategoriYok}
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-label={arka ? 'Kartın arkası — tekrar çevirmek için Enter' : 'Kartın ön yüzü — çevirmek için Enter'}
          onClick={() => setArka(!arka)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setArka(!arka) } }}
          style={{
            ...kartS,
            borderColor: arka ? 'var(--gok)' : 'var(--cizgi)',
            animation: 'gel .2s ease',
          }}
        >
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, letterSpacing: '.14em', textTransform: 'uppercase', color: 'var(--sis)', marginBottom: 10 }}>
            {kart.c}{kutu ? ` · ${M.kutu(kutu)}` : ''} · dokun-çevir
          </div>
          <div style={{
            fontSize: arka ? 15 : 17,
            fontWeight: arka ? 400 : 600,
            textAlign: arka ? 'left' : 'center',
            whiteSpace: 'pre-line',
          }}>
            {arka ? kart.a : kart.o}
          </div>
        </div>
      )}

      {/* Butonlar — recall-first: önce çevir, sonra derecelendir */}
      {kart && !arka ? (
        <p style={ipucuS}>{M.hatirla}</p>
      ) : (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '10px 0' }}>
          <button onClick={() => sonraki(false)} disabled={!kart || !arka} style={butonS}>{M.unuttum}</button>
          <button onClick={() => sonraki(true)} disabled={!kart || !arka} style={{ ...butonS, background: 'var(--ates)', borderColor: 'var(--ates)', color: '#20180c' }}>{M.bildim}</button>
        </div>
      )}
    </section>
  )
}

const h2S: React.CSSProperties = { fontFamily: 'Sofia Sans Condensed, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em', fontSize: 20, margin: '4px 0 2px' }
const aS: React.CSSProperties = { color: 'var(--sis)', fontSize: 13.5, margin: '0 0 14px' }
const ipucuS: React.CSSProperties = { color: 'var(--sis)', fontSize: 13, margin: '14px 2px', opacity: 0.8, textAlign: 'center' }
const chipS: React.CSSProperties = { border: '1px solid', borderRadius: 99, padding: '8px 12px', fontSize: 13.5, fontWeight: 600, cursor: 'pointer', minHeight: 40 }
const kartS: React.CSSProperties = { background: 'var(--panel)', border: '1px solid var(--cizgi)', borderRadius: 18, minHeight: 210, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', cursor: 'pointer' }
const butonS: React.CSSProperties = { display: 'inline-block', background: 'var(--panel2)', color: 'var(--sut)', border: '1px solid var(--cizgi)', borderRadius: 12, padding: '12px 16px', fontSize: 15, fontWeight: 600, cursor: 'pointer', minHeight: 48 }
