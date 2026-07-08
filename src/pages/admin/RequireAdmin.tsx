import { Navigate, Outlet, useLocation } from 'react-router'
import { useAuth } from '@/context/AuthContext'
import { Spinner } from '@/components/ui/Spinner'

export function RequireAdmin() {
  const { loading, user, profile, isAdmin } = useAuth()
  const location = useLocation()

  if (loading || (user && !profile)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-2 px-4 text-center">
        <h1 className="text-lg font-bold">Access denied</h1>
        <p className="text-sm text-muted-foreground">Your account doesn't have admin access.</p>
      </div>
    )
  }

  return <Outlet />
}
