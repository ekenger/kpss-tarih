/** Hafif, tutarlı çizgi ikon seti (stroke, currentColor). */
interface IkonProps { size?: number }

const svgOrtak = (size: number) => ({
  width: size, height: size, viewBox: '0 0 24 24',
  fill: 'none', stroke: 'currentColor', strokeWidth: 1.9,
  strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
})

export function IkonBugun({ size = 22 }: IkonProps) {
  return (
    <svg {...svgOrtak(size)}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" />
    </svg>
  )
}

export function IkonGunler({ size = 22 }: IkonProps) {
  return (
    <svg {...svgOrtak(size)}>
      <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="2" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="2" />
    </svg>
  )
}

export function IkonIlerleme({ size = 22 }: IkonProps) {
  return (
    <svg {...svgOrtak(size)}>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
    </svg>
  )
}

export function IkonGeri({ size = 20 }: IkonProps) {
  return (
    <svg {...svgOrtak(size)}>
      <path d="M15 5l-7 7 7 7" />
    </svg>
  )
}

export function IkonAlev({ size = 22 }: IkonProps) {
  return (
    <svg {...svgOrtak(size)} fill="currentColor" stroke="none">
      <path d="M12 2c.6 3.2-1.8 4.4-3.2 6.2C7.2 10.2 6.5 12 6.5 14a5.5 5.5 0 0 0 11 0c0-1.7-.7-3.2-1.8-4.6-.3 1-1 1.7-1.9 2 .7-2.2-.2-4.6-1.8-6-.3 1.4-1.1 2-2 2.6.8-2.2.3-4.6-1-6z" />
    </svg>
  )
}

export function IkonKilit({ size = 15 }: IkonProps) {
  return (
    <svg {...svgOrtak(size)}>
      <rect x="4.5" y="10.5" width="15" height="9" rx="2.2" />
      <path d="M7.5 10.5V7.5a4.5 4.5 0 0 1 9 0v3" />
    </svg>
  )
}

export function IkonTik({ size = 15 }: IkonProps) {
  return (
    <svg {...svgOrtak(size)}>
      <path d="M4 12.5l5 5 11-11" />
    </svg>
  )
}
