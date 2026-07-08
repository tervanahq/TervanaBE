import { Button } from '@/components/ui/Button'

export interface ReferenceOption {
  id: string
  label: string
}

export interface ProfileRowValue {
  key: string
  referenceId: string
  percentage: string
}

interface ProfileRowsEditorProps {
  title: string
  options: ReferenceOption[]
  rows: ProfileRowValue[]
  onChange: (rows: ProfileRowValue[]) => void
}

export function ProfileRowsEditor({ title, options, rows, onChange }: ProfileRowsEditorProps) {
  function updateRow(key: string, patch: Partial<ProfileRowValue>) {
    onChange(rows.map((r) => (r.key === key ? { ...r, ...patch } : r)))
  }

  function addRow() {
    onChange([...rows, { key: crypto.randomUUID(), referenceId: options[0]?.id ?? '', percentage: '' }])
  }

  function removeRow(key: string) {
    onChange(rows.filter((r) => r.key !== key))
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <Button type="button" variant="outline" size="sm" onClick={addRow} disabled={options.length === 0}>
          Add
        </Button>
      </div>
      {rows.length === 0 && <p className="text-xs text-muted-foreground">None added yet.</p>}
      <div className="space-y-2">
        {rows.map((row) => (
          <div key={row.key} className="flex items-center gap-2">
            <select
              value={row.referenceId}
              onChange={(e) => updateRow(row.key, { referenceId: e.target.value })}
              className="h-9 flex-1 rounded-lg border border-border bg-background px-2 text-sm focus:border-primary-500 focus:outline-none"
            >
              {options.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={row.percentage}
              onChange={(e) => updateRow(row.key, { percentage: e.target.value })}
              placeholder="%"
              className="h-9 w-20 rounded-lg border border-border bg-background px-2 text-sm focus:border-primary-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={() => removeRow(row.key)}
              aria-label={`Remove ${title.slice(0, -1)}`}
              className="text-muted-foreground hover:text-red-400"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
