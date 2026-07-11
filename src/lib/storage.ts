const PREFIX = 'zt_gun'

export function getZayifKartlar(gun: number): number[] {
  try {
    const raw = localStorage.getItem(`${PREFIX}${gun}`)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((x): x is number => typeof x === 'number')
  } catch {
    return []
  }
}

export function setZayifKartlar(gun: number, indices: number[]): void {
  try {
    localStorage.setItem(`${PREFIX}${gun}`, JSON.stringify(indices))
  } catch {
    // localStorage dolu olabilir, sessizce geç
  }
}
