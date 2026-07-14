interface ProfileMeterProps {
  label: string
  percentage: number
  fillRatio: number
  tone: 'primary' | 'gold'
}

export function ProfileMeter({ label, percentage, fillRatio, tone }: ProfileMeterProps) {
  const fillClass =
    tone === 'primary'
      ? 'bg-gradient-to-r from-primary-600 via-primary-500 to-primary-400'
      : 'bg-gradient-to-r from-gold-600 via-gold-500 to-gold-400'

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="font-mono text-xs tabular-nums text-muted-foreground">
          {percentage.toFixed(2)}%
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-hover">
        <div
          className={`animate-grow-bar h-full origin-left rounded-full ${fillClass}`}
          style={{ width: `${Math.min(Math.max(fillRatio * 100, 4), 100)}%` }}
        />
      </div>
    </div>
  )
}
