// Local-only progress for the Learn path. Consumer users are anonymous (there's no
// self-serve signup), so progress lives in localStorage rather than Supabase. If a
// logged-in learner profile ever exists, this module is the seam to swap the storage
// behind.

export interface LessonRecord {
  timesCompleted: number
  /** Best first-try accuracy across completions, 0..1. */
  bestAccuracy: number
}

export interface LearnProgress {
  xp: number
  /** Consecutive-day count as of `lastActiveDay`; may be stale — see effectiveStreak. */
  streak: number
  /** Local calendar day (YYYY-MM-DD) of the most recent lesson completion. */
  lastActiveDay: string | null
  lessons: Record<string, LessonRecord>
}

export const XP_LESSON = 10
export const XP_PERFECT_BONUS = 5
export const XP_REPLAY = 5

const STORAGE_KEY = 'tervana.learn.v1'

const emptyProgress = (): LearnProgress => ({
  xp: 0,
  streak: 0,
  lastActiveDay: null,
  lessons: {},
})

/** Local calendar day as YYYY-MM-DD (not UTC — streaks follow the user's clock). */
export function localDayString(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Whole days from `earlier` to `later` (both YYYY-MM-DD), DST-proof via UTC math. */
export function dayDiff(earlier: string, later: string): number {
  return (dayNumber(later) - dayNumber(earlier))
}

function dayNumber(day: string): number {
  const [y, m, d] = day.split('-').map(Number)
  return Date.UTC(y, m - 1, d) / 86_400_000
}

export function loadProgress(): LearnProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyProgress()
    const parsed = JSON.parse(raw) as Partial<LearnProgress>
    return {
      xp: typeof parsed.xp === 'number' ? parsed.xp : 0,
      streak: typeof parsed.streak === 'number' ? parsed.streak : 0,
      lastActiveDay: typeof parsed.lastActiveDay === 'string' ? parsed.lastActiveDay : null,
      lessons: parsed.lessons && typeof parsed.lessons === 'object' ? parsed.lessons : {},
    }
  } catch {
    // Corrupt JSON or storage unavailable (private mode) — start fresh, don't crash.
    return emptyProgress()
  }
}

function saveProgress(progress: LearnProgress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // Storage full/unavailable: the session still works, it just won't persist.
  }
}

/** Streak to display right now: 0 unless the last completion was today or yesterday. */
export function effectiveStreak(progress: LearnProgress, today = localDayString()): number {
  if (!progress.lastActiveDay) return 0
  return dayDiff(progress.lastActiveDay, today) <= 1 ? progress.streak : 0
}

/** Pure streak transition, exported for testability. */
export function nextStreak(
  current: { streak: number; lastActiveDay: string | null },
  today: string,
): number {
  if (!current.lastActiveDay) return 1
  const gap = dayDiff(current.lastActiveDay, today)
  if (gap === 0) return Math.max(current.streak, 1)
  if (gap === 1) return current.streak + 1
  return 1
}

export interface CompletionResult {
  progress: LearnProgress
  xpEarned: number
  streak: number
  /** True when this completion grew the streak (first activity of the day). */
  streakExtended: boolean
  firstCompletion: boolean
}

export function recordLessonCompletion(
  lessonId: string,
  accuracy: number,
  today = localDayString(),
): CompletionResult {
  const progress = loadProgress()
  const existing = progress.lessons[lessonId]
  const firstCompletion = !existing

  const xpEarned = firstCompletion
    ? XP_LESSON + (accuracy >= 1 ? XP_PERFECT_BONUS : 0)
    : XP_REPLAY

  const streak = nextStreak(progress, today)
  const streakExtended = progress.lastActiveDay !== today

  const updated: LearnProgress = {
    xp: progress.xp + xpEarned,
    streak,
    lastActiveDay: today,
    lessons: {
      ...progress.lessons,
      [lessonId]: {
        timesCompleted: (existing?.timesCompleted ?? 0) + 1,
        bestAccuracy: Math.max(existing?.bestAccuracy ?? 0, accuracy),
      },
    },
  }
  saveProgress(updated)
  return { progress: updated, xpEarned, streak, streakExtended, firstCompletion }
}

export function isLessonCompleted(progress: LearnProgress, lessonId: string): boolean {
  return Boolean(progress.lessons[lessonId])
}

export function completedCount(progress: LearnProgress): number {
  return Object.keys(progress.lessons).length
}
