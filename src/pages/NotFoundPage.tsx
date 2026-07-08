import { Link } from 'react-router'
import { buttonClasses } from '@/components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-xl font-bold">Page not found</h1>
      <p className="text-sm text-muted-foreground">
        That page doesn't exist. If you were scanning a product code, try scanning it again.
      </p>
      <Link to="/" className={buttonClasses()}>
        Back home
      </Link>
    </div>
  )
}
