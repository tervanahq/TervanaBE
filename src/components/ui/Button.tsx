import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-gradient-to-b from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-900/40 hover:from-primary-400 hover:to-primary-600 active:from-primary-600 active:to-primary-700',
  secondary:
    'bg-gradient-to-b from-gold-400 to-gold-500 text-black shadow-lg shadow-gold-900/40 hover:from-gold-300 hover:to-gold-500 active:from-gold-500 active:to-gold-600',
  outline: 'border border-border text-foreground hover:border-primary-700 hover:bg-surface-hover',
  ghost: 'text-foreground hover:bg-surface-hover',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
}

/** Shared class builder so non-<button> elements (e.g. a <Link>) can look like a Button. */
export function buttonClasses(variant: Variant = 'primary', size: Size = 'md', className = '') {
  return `inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button className={buttonClasses(variant, size, className)} {...rest}>
      {children}
    </button>
  )
}
