import { Link } from 'react-router'
import { TervanaMark } from '@/components/brand/TervanaMark'

export function Header() {
  return (
    <header className="sticky top-0 z-10 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">
        <Link to="/" className="group flex items-center gap-2.5">
          <TervanaMark className="h-8 w-8 transition-transform duration-300 group-hover:scale-110" />
          <span className="text-sm font-extrabold tracking-[0.22em] text-foreground">TERVANA</span>
        </Link>
        <Link
          to="/learn"
          className="rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-foreground transition hover:border-primary-700 hover:bg-surface-hover"
        >
          Learn
        </Link>
      </div>
      <div
        aria-hidden="true"
        className="h-px w-full bg-gradient-to-r from-accent-500/50 via-primary-500/50 to-gold-400/50"
      />
    </header>
  )
}
