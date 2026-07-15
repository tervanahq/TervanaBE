import { Link, Outlet } from 'react-router'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'

export function AdminLayout() {
  const { signOut, profile } = useAuth()

  return (
    <div className="min-h-svh">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-6">
            <Link to="/admin/products" className="font-semibold">
              Tervana <span className="text-muted-foreground">Admin</span>
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link to="/admin/products" className="text-muted-foreground hover:text-foreground">
                Products
              </Link>
              <Link to="/admin/brands" className="text-muted-foreground hover:text-foreground">
                Brands
              </Link>
              <Link to="/admin/misses" className="text-muted-foreground hover:text-foreground">
                To add
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="hidden sm:inline">{profile?.email}</span>
            <Button variant="outline" size="sm" onClick={() => void signOut()}>
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
