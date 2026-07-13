import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'

export function AdminResetPasswordPage() {
  const { updatePassword } = useAuth()
  const navigate = useNavigate()

  const [checkingSession, setCheckingSession] = useState(true)
  const [hasRecoverySession, setHasRecoverySession] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    // The recovery link redirects here with a token that supabase-js exchanges
    // for a session automatically; that can take a moment after mount.
    supabase.auth.getSession().then(({ data }) => {
      setHasRecoverySession(!!data.session)
      setCheckingSession(false)
    })
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError("Passwords don't match.")
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setSubmitting(true)
    setError(null)
    const { error } = await updatePassword(password)
    setSubmitting(false)

    if (error) {
      setError(error)
      return
    }
    setDone(true)
  }

  if (checkingSession) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-12">
      <Card className="space-y-5">
        <div>
          <h1 className="text-lg font-bold">Set a new password</h1>
        </div>

        {!hasRecoverySession ? (
          <p className="text-sm text-red-400">
            This reset link is invalid or has expired. Request a new one from the sign-in page.
          </p>
        ) : done ? (
          <div className="space-y-3">
            <p className="text-sm text-primary-400">Password updated.</p>
            <Button className="w-full" onClick={() => navigate('/admin/login')}>
              Go to sign in
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="new-password" className="text-xs font-medium text-muted-foreground">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="confirm-password" className="text-xs font-medium text-muted-foreground">
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Updating…' : 'Update password'}
            </Button>
          </form>
        )}
      </Card>
    </div>
  )
}
