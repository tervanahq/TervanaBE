import { useState, type ReactNode } from 'react'
import { Link } from 'react-router'
import { orderedLessons, totalLessonCount, units, type UnitColor } from '@/data/learnContent'
import {
  completedCount,
  effectiveStreak,
  isLessonCompleted,
  loadProgress,
} from '@/lib/learnProgress'
import { BoltIcon, CheckIcon, FlameIcon, LockIcon, StarIcon } from '@/components/learn/LearnIcons'

interface UnitTheme {
  header: string
  node: string
  ring: string
  label: string
}

// Tailwind v4 extracts class names statically, so every unit color variant is a
// literal string here rather than interpolated.
const unitThemes: Record<UnitColor, UnitTheme> = {
  primary: {
    header: 'bg-gradient-to-br from-primary-600 to-primary-900',
    node: 'bg-gradient-to-b from-primary-400 to-primary-600 text-white shadow-lg shadow-primary-900/50',
    ring: 'ring-primary-500/35',
    label: 'border-primary-800 text-primary-400',
  },
  gold: {
    header: 'bg-gradient-to-br from-gold-600 to-gold-900',
    node: 'bg-gradient-to-b from-gold-300 to-gold-500 text-black shadow-lg shadow-gold-900/50',
    ring: 'ring-gold-400/35',
    label: 'border-gold-800 text-gold-400',
  },
  accent: {
    header: 'bg-gradient-to-br from-accent-600 to-accent-900',
    node: 'bg-gradient-to-b from-accent-400 to-accent-600 text-white shadow-lg shadow-accent-900/50',
    ring: 'ring-accent-500/35',
    label: 'border-accent-800 text-accent-400',
  },
}

// Horizontal snake offsets, cycled by global lesson index.
const NODE_OFFSETS = [0, 52, 0, -52]

type NodeState = 'completed' | 'current' | 'locked'

export function LearnPage() {
  const [progress] = useState(() => loadProgress())

  // Sequential unlock: everything up to (and including) the first incomplete lesson.
  const firstIncompleteIndex = orderedLessons.findIndex(
    ({ lesson }) => !isLessonCompleted(progress, lesson.id),
  )
  const unlockedUpTo = firstIncompleteIndex === -1 ? orderedLessons.length : firstIncompleteIndex

  const streak = effectiveStreak(progress)
  const done = completedCount(progress)
  let globalIndex = 0

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="animate-fade-up space-y-1 text-center">
        <p className="text-sm font-semibold tracking-wide text-primary-400 uppercase">Learn</p>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          The science, one bite at a time
        </h1>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">
          Short lessons on cannabinoids, terpenes, and smart consumption. Finish a lesson a day
          to keep your streak alive.
        </p>
      </div>

      <div className="animate-fade-up mt-6 grid grid-cols-3 gap-3 [animation-delay:0.08s]">
        <StatChip
          icon={<FlameIcon className={`h-5 w-5 ${streak > 0 ? 'text-orange-400' : 'text-muted-foreground/50'}`} />}
          value={String(streak)}
          label="day streak"
        />
        <StatChip
          icon={<BoltIcon className="h-5 w-5 text-gold-400" />}
          value={String(progress.xp)}
          label="total XP"
        />
        <StatChip
          icon={<CheckIcon className="h-5 w-5 text-primary-400" />}
          value={`${done}/${totalLessonCount}`}
          label="lessons"
        />
      </div>

      <div className="mt-10 space-y-12 pb-8">
        {units.map((unit, unitIndex) => {
          const theme = unitThemes[unit.color]
          const unitDone = unit.lessons.filter((l) => isLessonCompleted(progress, l.id)).length
          return (
            <section key={unit.id} className="animate-fade-up" style={{ animationDelay: `${0.16 + unitIndex * 0.06}s` }}>
              <div className={`rounded-2xl p-5 text-white shadow-lg ${theme.header}`}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-[11px] font-extrabold tracking-[0.2em] uppercase opacity-80">
                    Unit {unitIndex + 1}
                  </p>
                  <p className="text-[11px] font-bold opacity-80">
                    {unitDone}/{unit.lessons.length}
                  </p>
                </div>
                <h2 className="mt-1 text-lg font-bold">{unit.title}</h2>
                <p className="mt-0.5 text-xs opacity-85">{unit.tagline}</p>
              </div>

              <div className="mt-8 flex flex-col items-center gap-12">
                {unit.lessons.map((lesson) => {
                  const i = globalIndex++
                  const state: NodeState = isLessonCompleted(progress, lesson.id)
                    ? 'completed'
                    : i <= unlockedUpTo
                      ? 'current'
                      : 'locked'
                  return (
                    <LessonNode
                      key={lesson.id}
                      title={lesson.title}
                      lessonId={lesson.id}
                      state={state}
                      theme={theme}
                      offsetX={NODE_OFFSETS[i % NODE_OFFSETS.length]}
                    />
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      <p className="pb-4 text-center text-xs text-muted-foreground/70">
        Progress is saved on this device. Replaying a finished lesson earns a little bonus XP.
      </p>
    </div>
  )
}

function StatChip({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-border bg-surface px-3 py-2.5">
      {icon}
      <div className="min-w-0">
        <p className="text-sm leading-tight font-bold text-foreground">{value}</p>
        <p className="truncate text-[10px] leading-tight text-muted-foreground">{label}</p>
      </div>
    </div>
  )
}

function LessonNode({
  title,
  lessonId,
  state,
  theme,
  offsetX,
}: {
  title: string
  lessonId: string
  state: NodeState
  theme: UnitTheme
  offsetX: number
}) {
  const circleBase =
    'relative flex h-16 w-16 items-center justify-center rounded-full transition-transform duration-200'

  return (
    <div
      className="flex w-32 flex-col items-center gap-2"
      style={{ transform: `translateX(${offsetX}px)` }}
    >
      {state === 'locked' ? (
        <div
          aria-label={`${title} — locked`}
          className={`${circleBase} border-2 border-border bg-surface text-muted-foreground/40`}
        >
          <LockIcon className="h-6 w-6" />
        </div>
      ) : (
        <Link
          to={`/learn/${lessonId}`}
          aria-label={state === 'completed' ? `${title} — completed, tap to replay` : `${title} — start lesson`}
          className={`${circleBase} ${theme.node} hover:scale-105 active:scale-95 ${
            state === 'current' ? `ring-8 ${theme.ring}` : ''
          }`}
        >
          {state === 'current' && (
            <span
              className={`absolute -top-11 left-1/2 -translate-x-1/2 animate-bounce rounded-xl border bg-background px-3 py-1 text-[11px] font-extrabold tracking-[0.15em] whitespace-nowrap uppercase ${theme.label}`}
            >
              Start
            </span>
          )}
          {state === 'completed' ? (
            <CheckIcon className="h-7 w-7" />
          ) : (
            <StarIcon className="h-7 w-7" />
          )}
        </Link>
      )}
      <p
        className={`text-center text-xs leading-snug font-medium ${
          state === 'locked' ? 'text-muted-foreground/50' : 'text-foreground'
        }`}
      >
        {title}
      </p>
    </div>
  )
}
