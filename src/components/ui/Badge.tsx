import type { ReactNode } from 'react'

type Variant = 'primary' | 'gold' | 'neutral' | 'warning'

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary-950 text-primary-300 border-primary-800',
  gold: 'bg-gold-950 text-gold-300 border-gold-800',
  neutral: 'bg-muted text-muted-foreground border-border',
  warning: 'bg-amber-950 text-amber-300 border-amber-800',
}

export function Badge({
  children,
  variant = 'neutral',
  className = '',
}: {
  children: ReactNode
  variant?: Variant
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
