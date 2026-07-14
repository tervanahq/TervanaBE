import { useMemo, useState, type ReactNode } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router'
import {
  findLesson,
  type ChoiceExercise,
  type Exercise,
  type Lesson,
  type MatchExercise,
  type UnitColor,
} from '@/data/learnContent'
import { recordLessonCompletion, type CompletionResult } from '@/lib/learnProgress'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { BoltIcon, CheckIcon, FlameIcon, StarIcon, XIcon } from '@/components/learn/LearnIcons'

const barFill: Record<UnitColor, string> = {
  primary: 'bg-gradient-to-r from-primary-600 to-primary-400',
  gold: 'bg-gradient-to-r from-gold-600 to-gold-400',
  accent: 'bg-gradient-to-r from-accent-600 to-accent-400',
}

export function LessonPage() {
  const { lessonId } = useParams()
  const found = lessonId ? findLesson(lessonId) : undefined
  if (!found) return <Navigate to="/learn" replace />
  // key resets all player state if the route ever swaps lessons in place
  return <LessonPlayer key={found.lesson.id} lesson={found.lesson} color={found.unit.color} />
}

interface QueueItem {
  exercise: Exercise
  /** Original exercise index; requeued copies share it. */
  key: number
}

function identity(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i)
}

function shuffledOrder(n: number): number[] {
  const arr = identity(n)
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

/** Display order for a choice exercise's options (T/F and other `ordered` ones stay put). */
function makeOrder(exercise: Exercise): number[] {
  if (exercise.type !== 'choice' || exercise.ordered) {
    return identity(exercise.type === 'choice' ? exercise.options.length : 0)
  }
  return shuffledOrder(exercise.options.length)
}

function LessonPlayer({ lesson, color }: { lesson: Lesson; color: UnitColor }) {
  const navigate = useNavigate()
  const total = lesson.exercises.length

  const [queue, setQueue] = useState<QueueItem[]>(() =>
    lesson.exercises.map((exercise, key) => ({ exercise, key })),
  )
  const [pos, setPos] = useState(0)
  const [phase, setPhase] = useState<'answer' | 'feedback' | 'done'>('answer')
  const [selected, setSelected] = useState<number | null>(null)
  const [order, setOrder] = useState<number[]>(() => makeOrder(lesson.exercises[0]))
  const [wasCorrect, setWasCorrect] = useState(true)
  const [matchMistakes, setMatchMistakes] = useState(0)
  const [missedKeys, setMissedKeys] = useState<ReadonlySet<number>>(new Set())
  const [solvedCount, setSolvedCount] = useState(0)
  const [result, setResult] = useState<CompletionResult | null>(null)
  const [quitPromptOpen, setQuitPromptOpen] = useState(false)

  const current = queue[pos]

  function handleCheck() {
    if (selected === null || current.exercise.type !== 'choice') return
    const correct = order[selected] === current.exercise.correctIndex
    setWasCorrect(correct)
    if (correct) {
      setSolvedCount((c) => c + 1)
    } else {
      setMissedKeys((prev) => new Set(prev).add(current.key))
      setQueue((q) => [...q, current]) // see it again at the end of the lesson
    }
    setPhase('feedback')
  }

  function handleMatchComplete(mistakes: number) {
    if (mistakes > 0) {
      setMissedKeys((prev) => new Set(prev).add(current.key))
    }
    setMatchMistakes(mistakes)
    setWasCorrect(true)
    setSolvedCount((c) => c + 1)
    setPhase('feedback')
  }

  function handleContinue() {
    const next = pos + 1
    if (next < queue.length) {
      setPos(next)
      setOrder(makeOrder(queue[next].exercise))
      setSelected(null)
      setMatchMistakes(0)
      setPhase('answer')
      return
    }
    const accuracy = (total - missedKeys.size) / total
    setResult(recordLessonCompletion(lesson.id, accuracy))
    setPhase('done')
  }

  if (phase === 'done' && result) {
    return <CompletionScreen lesson={lesson} result={result} missedCount={missedKeys.size} total={total} />
  }

  const progressPct = Math.round((solvedCount / total) * 100)

  return (
    <div className="mx-auto flex min-h-[70svh] max-w-2xl flex-col px-4 py-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Quit lesson"
          onClick={() => setQuitPromptOpen(true)}
          className="rounded-full p-2 text-muted-foreground transition hover:bg-surface-hover hover:text-foreground"
        >
          <XIcon className="h-5 w-5" />
        </button>
        <div
          className="h-3.5 flex-1 overflow-hidden rounded-full bg-surface"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Lesson progress"
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ${barFill[color]}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="w-12 text-right text-xs font-bold text-muted-foreground tabular-nums">
          {solvedCount}/{total}
        </p>
      </div>

      <div className="mt-8 flex-1" key={`${current.key}-${pos}`}>
        <p className="animate-fade-up text-lg leading-snug font-bold text-balance sm:text-xl">
          {current.exercise.prompt}
        </p>

        {current.exercise.type === 'choice' ? (
          <ChoiceBoard
            exercise={current.exercise}
            order={order}
            selected={selected}
            revealed={phase === 'feedback'}
            onSelect={setSelected}
          />
        ) : (
          <MatchBoard exercise={current.exercise} locked={phase === 'feedback'} onComplete={handleMatchComplete} />
        )}
      </div>

      <div className="mt-8">
        {phase === 'answer' ? (
          current.exercise.type === 'choice' ? (
            <Button size="lg" className="w-full" disabled={selected === null} onClick={handleCheck}>
              Check
            </Button>
          ) : (
            <p className="text-center text-xs text-muted-foreground">Match all the pairs to continue.</p>
          )
        ) : (
          <FeedbackBanner
            exercise={current.exercise}
            wasCorrect={wasCorrect}
            matchMistakes={matchMistakes}
            onContinue={handleContinue}
          />
        )}
      </div>

      {quitPromptOpen && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-sm space-y-4">
            <h2 className="text-base font-bold">Leave the lesson?</h2>
            <p className="text-sm text-muted-foreground">
              Progress in this lesson won't be saved — you'll start it fresh next time.
            </p>
            <div className="flex flex-col gap-2">
              <Button onClick={() => setQuitPromptOpen(false)}>Keep learning</Button>
              <Button variant="ghost" className="text-red-400" onClick={() => navigate('/learn')}>
                Leave
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

function ChoiceBoard({
  exercise,
  order,
  selected,
  revealed,
  onSelect,
}: {
  exercise: ChoiceExercise
  order: number[]
  selected: number | null
  revealed: boolean
  onSelect: (i: number) => void
}) {
  return (
    <div className="mt-6 flex flex-col gap-2.5">
      {order.map((optionIndex, displayIndex) => {
        const isSelected = selected === displayIndex
        const isCorrect = optionIndex === exercise.correctIndex

        let stateClasses = 'border-border bg-surface hover:border-primary-700 hover:bg-surface-hover'
        if (!revealed && isSelected) {
          stateClasses = 'border-primary-500 bg-primary-950/40'
        } else if (revealed) {
          if (isCorrect) {
            stateClasses = 'border-primary-500 bg-primary-950/50'
          } else if (isSelected) {
            stateClasses = 'border-red-500 bg-red-950/40'
          } else {
            stateClasses = 'border-border bg-surface opacity-50'
          }
        }

        return (
          <button
            key={optionIndex}
            type="button"
            disabled={revealed}
            onClick={() => onSelect(displayIndex)}
            className={`animate-fade-up rounded-xl border-2 px-4 py-3.5 text-left text-sm font-medium transition-colors duration-150 ${stateClasses}`}
            style={{ animationDelay: `${0.05 + displayIndex * 0.05}s` }}
          >
            {exercise.options[optionIndex]}
          </button>
        )
      })}
    </div>
  )
}

function MatchBoard({
  exercise,
  locked,
  onComplete,
}: {
  exercise: MatchExercise
  locked: boolean
  onComplete: (mistakes: number) => void
}) {
  const rightOrder = useMemo(() => shuffledOrder(exercise.pairs.length), [exercise])
  const [leftSel, setLeftSel] = useState<number | null>(null)
  const [rightSel, setRightSel] = useState<number | null>(null)
  const [matched, setMatched] = useState<ReadonlySet<number>>(new Set())
  const [mistakes, setMistakes] = useState(0)
  const [wrongPair, setWrongPair] = useState<{ left: number; right: number } | null>(null)

  function tryMatch(left: number | null, right: number | null) {
    if (left === null || right === null) return
    if (left === right) {
      const nextMatched = new Set(matched).add(left)
      setMatched(nextMatched)
      setLeftSel(null)
      setRightSel(null)
      if (nextMatched.size === exercise.pairs.length) onComplete(mistakes)
    } else {
      setMistakes((m) => m + 1)
      setWrongPair({ left, right })
      setLeftSel(null)
      setRightSel(null)
      window.setTimeout(() => setWrongPair(null), 600)
    }
  }

  function classFor(pairIndex: number, side: 'left' | 'right', isSelected: boolean) {
    if (matched.has(pairIndex)) {
      return 'border-primary-800 bg-primary-950/30 text-muted-foreground opacity-60'
    }
    if (wrongPair && wrongPair[side] === pairIndex) {
      return 'border-red-500 bg-red-950/40'
    }
    if (isSelected) {
      return 'border-primary-500 bg-primary-950/40'
    }
    return 'border-border bg-surface hover:border-primary-700 hover:bg-surface-hover'
  }

  return (
    <div className="mt-6 grid grid-cols-2 gap-2.5">
      <div className="flex flex-col gap-2.5">
        {exercise.pairs.map((pair, i) => (
          <button
            key={pair.left}
            type="button"
            disabled={locked || matched.has(i)}
            onClick={() => {
              const next = leftSel === i ? null : i
              setLeftSel(next)
              tryMatch(next, rightSel)
            }}
            className={`flex-1 rounded-xl border-2 px-3 py-3 text-left text-sm font-medium transition-colors duration-150 ${classFor(i, 'left', leftSel === i)}`}
          >
            {pair.left}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-2.5">
        {rightOrder.map((pairIndex) => (
          <button
            key={exercise.pairs[pairIndex].right}
            type="button"
            disabled={locked || matched.has(pairIndex)}
            onClick={() => {
              const next = rightSel === pairIndex ? null : pairIndex
              setRightSel(next)
              tryMatch(leftSel, next)
            }}
            className={`flex-1 rounded-xl border-2 px-3 py-3 text-left text-sm font-medium transition-colors duration-150 ${classFor(pairIndex, 'right', rightSel === pairIndex)}`}
          >
            {exercise.pairs[pairIndex].right}
          </button>
        ))}
      </div>
    </div>
  )
}

function FeedbackBanner({
  exercise,
  wasCorrect,
  matchMistakes,
  onContinue,
}: {
  exercise: Exercise
  wasCorrect: boolean
  matchMistakes: number
  onContinue: () => void
}) {
  const isMatch = exercise.type === 'match'
  return (
    <div
      className={`animate-fade-up rounded-2xl border-2 p-4 ${
        wasCorrect ? 'border-primary-800 bg-primary-950/60' : 'border-red-800 bg-red-950/40'
      }`}
    >
      <p className={`text-base font-bold ${wasCorrect ? 'text-primary-300' : 'text-red-300'}`}>
        {wasCorrect
          ? isMatch
            ? matchMistakes > 0
              ? 'All matched — with a few misses.'
              : 'Perfect matching!'
            : 'Nice!'
          : 'Not quite.'}
      </p>
      {!wasCorrect && exercise.type === 'choice' && (
        <p className="mt-1 text-sm font-semibold text-foreground">
          Correct answer: {exercise.options[exercise.correctIndex]}
        </p>
      )}
      {exercise.type === 'choice' && (
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{exercise.explanation}</p>
      )}
      {!wasCorrect && (
        <p className="mt-1.5 text-xs text-muted-foreground/80">
          This one will come back around before the lesson ends.
        </p>
      )}
      <Button size="lg" className="mt-4 w-full" onClick={onContinue}>
        Continue
      </Button>
    </div>
  )
}

function CompletionScreen({
  lesson,
  result,
  missedCount,
  total,
}: {
  lesson: Lesson
  result: CompletionResult
  missedCount: number
  total: number
}) {
  const navigate = useNavigate()
  const accuracyPct = Math.round(((total - missedCount) / total) * 100)

  return (
    <div className="mx-auto flex min-h-[70svh] max-w-2xl flex-col items-center justify-center gap-8 px-4 py-12 text-center">
      <div className="animate-fade-up space-y-3">
        <div className="relative mx-auto h-20 w-20">
          <div className="absolute inset-0 rounded-full bg-gold-400/25 blur-2xl" />
          <StarIcon className="relative h-20 w-20 text-gold-400" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Lesson complete!</h1>
        <p className="text-sm text-muted-foreground">{lesson.title}</p>
      </div>

      <div className="animate-fade-up grid w-full max-w-sm grid-cols-3 gap-3 [animation-delay:0.12s]">
        <ResultChip
          icon={<BoltIcon className="h-5 w-5 text-gold-400" />}
          value={`+${result.xpEarned}`}
          label="XP earned"
        />
        <ResultChip
          icon={<CheckIcon className="h-5 w-5 text-primary-400" />}
          value={`${accuracyPct}%`}
          label="accuracy"
        />
        <ResultChip
          icon={<FlameIcon className="h-5 w-5 text-orange-400" />}
          value={String(result.streak)}
          label="day streak"
        />
      </div>

      {result.firstCompletion && accuracyPct === 100 && (
        <p className="animate-fade-up text-sm font-semibold text-gold-400 [animation-delay:0.2s]">
          Flawless — perfect bonus included.
        </p>
      )}
      {result.streakExtended && result.streak > 1 && (
        <p className="animate-fade-up text-sm text-muted-foreground [animation-delay:0.24s]">
          That's {result.streak} days in a row. Keep it going tomorrow!
        </p>
      )}

      <div className="animate-fade-up w-full max-w-sm [animation-delay:0.3s]">
        <Button size="lg" className="w-full" onClick={() => navigate('/learn')}>
          Back to the path
        </Button>
      </div>
    </div>
  )
}

function ResultChip({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-border bg-surface px-2 py-3">
      {icon}
      <p className="text-sm font-bold text-foreground">{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  )
}
