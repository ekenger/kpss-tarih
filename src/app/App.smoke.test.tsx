import { describe, test, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import App from './App'
import { useStore } from '../store'

// Kabuk/yönlendirme dumanı: yeni bilgi mimarisinin runtime'da çökmediğini doğrular.
beforeEach(() => {
  localStorage.clear()
  useStore.setState({ anaSekme: 'bugun', aktifGun: 0, aktifModul: 'kodlar' })
})
afterEach(cleanup)

describe('App kabuğu', () => {
  test('3 global sekme her zaman görünür (ana sayfada da işlevsel)', () => {
    render(<App />)
    expect(screen.getByRole('button', { name: /Bugün/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /Günler/ })).toBeTruthy()
    expect(screen.getByRole('button', { name: /İlerleme/ })).toBeTruthy()
  })

  test('İlerleme sekmesine geçiş çökmeden çalışır', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /İlerleme/ }))
    expect(useStore.getState().anaSekme).toBe('ilerleme')
    // İlerleme başlığı render olur
    expect(screen.getByRole('heading', { name: 'İlerleme' })).toBeTruthy()
  })

  test('global sekmeye geçince açık gün sıfırlanır', () => {
    useStore.setState({ aktifGun: 5, anaSekme: 'gunler' })
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Bugün/ }))
    expect(useStore.getState().aktifGun).toBe(0)
    expect(useStore.getState().anaSekme).toBe('bugun')
  })
})
