import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export function AdminLoginPage() {
  const { user, isAdmin, signInWithPassword, requestPasswordReset } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [mode, setMode] = useState<'sign-in' | 'reset'>('sign-in')
  const [resetSent, setResetSent] = useState(false)

  if (user && isAdmin) {
    const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/admin/products'
    return <Navigate to={from} replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error } = await signInWithPassword(email, password)
    setSubmitting(false)
    if (error) {
      setError(error)
      return
    }
    navigate('/admin/products')
  }

  async function handleResetRequest(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    const { error } = await requestPasswordReset(email)
    setSubmitting(false)
    if (error) {
      setError(error)
      return
    }
    setResetSent(true)
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-12">
      <Card className="space-y-5">
        {mode === 'sign-in' ? (
          <>
            <div>
              <h1 className="text-lg font-bold">Admin sign in</h1>
              <p className="text-sm text-muted-foreground">Internal access for Tervana staff.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="email" className="text-xs font-medium text-muted-foreground">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="password" className="text-xs font-medium text-muted-foreground">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
                />
              </div>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Signing in…' : 'Sign in'}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setMode('reset')
                  setError(null)
                  setResetSent(false)
                }}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
              >
                Forgot password?
              </button>
            </form>
          </>
        ) : (
          <>
            <div>
              <h1 className="text-lg font-bold">Reset password</h1>
              <p className="text-sm text-muted-foreground">
                Enter your email and we'll send a link to set a new password.
              </p>
            </div>
            {resetSent ? (
              <p className="text-sm text-primary-400">
                If an account exists for that email, a reset link is on its way.
              </p>
            ) : (
              <form onSubmit={handleResetRequest} className="space-y-3">
                <div className="space-y-1">
                  <label htmlFor="reset-email" className="text-xs font-medium text-muted-foreground">
                    Email
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
                  />
                </div>
                {error && <p className="text-sm text-red-400">{error}</p>}
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? 'Sending…' : 'Send reset link'}
                </Button>
              </form>
            )}
            <button
              type="button"
              onClick={() => {
                setMode('sign-in')
                setError(null)
                setResetSent(false)
              }}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground"
            >
              Back to sign in
            </button>
          </>
        )}
      </Card>
    </div>
  )
}
