import { useId } from 'react'

/**
 * Inline SVG recreation of the Tervana logo mark: a purple-to-gold gradient
 * arch over a gold hill, with a green cannabis leaf inside. Kept as a
 * component (rather than an <img>) so it inherits sizing from className and
 * needs no asset request. Gradient ids are namespaced with useId because the
 * mark renders more than once per page (header, hero, footer).
 */
const LEAF_BLADES: Array<{ angle: number; scale: number }> = [
  { angle: 0, scale: 1 },
  { angle: -26, scale: 0.88 },
  { angle: 26, scale: 0.88 },
  { angle: -52, scale: 0.7 },
  { angle: 52, scale: 0.7 },
  { angle: -78, scale: 0.48 },
  { angle: 78, scale: 0.48 },
]

const BLADE_PATH = 'M50 60 C54.5 49 53.5 35 50 27 C46.5 35 45.5 49 50 60 Z'

export function TervanaMark({ className = '' }: { className?: string }) {
  const gradientId = useId()

  return (
    <svg viewBox="0 0 100 100" fill="none" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id={gradientId} x1="50" y1="16" x2="50" y2="92" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#8460c6" />
          <stop offset="1" stopColor="#f0b429" />
        </linearGradient>
      </defs>

      {/* Hill */}
      <path d="M22 91 Q50 63 78 91 Z" fill="#f0b429" />

      {/* Stem */}
      <path d="M48.9 60 L51.1 60 L50.7 76 L49.3 76 Z" fill="#3e9350" />

      {/* Leaf */}
      {LEAF_BLADES.map(({ angle, scale }) => (
        <path
          key={angle}
          d={BLADE_PATH}
          fill="#3e9350"
          transform={`rotate(${angle} 50 60) translate(50 60) scale(${scale}) translate(-50 -60)`}
        />
      ))}

      {/* Arch */}
      <path
        d="M19 91 L19 52 A31 31 0 0 1 81 52 L81 91"
        stroke={`url(#${gradientId})`}
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  )
}
