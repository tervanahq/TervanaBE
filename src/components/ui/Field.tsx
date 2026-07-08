import type { ReactNode } from 'react'

export const inputClass =
  'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-primary-500 focus:outline-none'

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {children}
    </div>
  )
}
