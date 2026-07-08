interface ProfileMeterProps {
  label: string
  percentage: number
  fillRatio: number
  tone: 'primary' | 'gold'
}

export function ProfileMeter({ label, percentage, fillRatio, tone }: ProfileMeterProps) {
  const fillClass = tone === 'primary' ? 'bg-primary-500' : 'bg-gold-500'

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
          className={`h-full rounded-full ${fillClass}`}
          style={{ width: `${Math.min(Math.max(fillRatio * 100, 4), 100)}%` }}
        />
      </div>
    </div>
  )
}
