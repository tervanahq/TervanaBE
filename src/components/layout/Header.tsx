import { Link } from 'react-router'

export function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-2xl items-center px-4">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span aria-hidden="true" className="text-lg text-primary-400">
            ⬡
          </span>
          <span>
            Ter<span className="text-primary-400">vana</span>
          </span>
        </Link>
      </div>
    </header>
  )
}
