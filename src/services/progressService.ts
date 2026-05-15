import { supabase } from '../lib/supabase'
import { totalLessons } from '../data/lessons'

export type ProgressState = {
  completion: number        // 0–1
  points: number            // total XP
  streak: number            // consecutive days
  badges: string[]          // achievement IDs
  hearts: number            // lives (max 5)
  coins: number             // currency
  lastActive: string | null // YYYY-MM-DD
  completedLessons: string[]
  claimedMissions: string[]
}

export const MAX_HEARTS = 5

const STORAGE_KEY = 'salulearn_progress_v2'

const getLocalToday = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function getDefaultProgress(): ProgressState {
  return {
    completion: 0,
    points: 0,
    streak: 0,
    badges: [],
    hearts: MAX_HEARTS,
    coins: 0,
    lastActive: null,
    completedLessons: [],
    claimedMissions: [],
  }
}

export function loadLocalProgress(): ProgressState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as ProgressState
  } catch {
    return null
  }
}

export function saveLocalProgress(p: ProgressState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
  } catch {
    // ignore storage errors
  }
}

export function calculateStreak(
  lastActive: string | null,
  currentStreak: number
): { streak: number; isNewDay: boolean } {
  const today = getLocalToday()
  if (!lastActive) return { streak: 1, isNewDay: true }
  if (lastActive === today) return { streak: currentStreak, isNewDay: false }

  const last = new Date(lastActive)
  const now = new Date(today)
  const diffDays = Math.round((now.getTime() - last.getTime()) / 86400000)

  if (diffDays === 1) return { streak: currentStreak + 1, isNewDay: true }
  if (diffDays > 1) return { streak: 1, isNewDay: true }
  return { streak: currentStreak, isNewDay: false }
}

export function completeLesson(
  prev: ProgressState,
  lessonId: string,
  xpReward: number,
  heartsLost: number = 0
): ProgressState {
  if (prev.completedLessons.includes(lessonId)) return prev

  const completedLessons = [...prev.completedLessons, lessonId]
  const completion = completedLessons.length / totalLessons
  const points = prev.points + xpReward
  const hearts = Math.max(0, Math.min(MAX_HEARTS, prev.hearts - heartsLost))
  const coins = prev.coins + Math.floor(xpReward / 5)

  const today = getLocalToday()
  const { streak, isNewDay } = calculateStreak(prev.lastActive, prev.streak)

  const next: ProgressState = {
    ...prev,
    completedLessons,
    completion,
    points,
    hearts,
    coins,
    streak,
    lastActive: isNewDay ? today : prev.lastActive,
    badges: checkBadges({ ...prev, points, streak, completedLessons }),
  }

  saveLocalProgress(next)
  return next
}

function checkBadges(p: ProgressState): string[] {
  const badges = new Set(p.badges)
  if (p.completedLessons.length >= 1) badges.add('first_mission')
  if (p.points >= 100) badges.add('xp_100')
  if (p.points >= 500) badges.add('xp_500')
  if (p.points >= 1000) badges.add('xp_1000')
  if (p.streak >= 3) badges.add('streak_3')
  if (p.streak >= 7) badges.add('streak_7')
  if (p.streak >= 30) badges.add('streak_30')
  if (p.completion >= 0.5) badges.add('half_complete')
  if (p.completion >= 1) badges.add('full_complete')
  return Array.from(badges)
}

export function addTrainingXp(prev: ProgressState, xp: number): ProgressState {
  if (xp <= 0) return prev
  const points = prev.points + xp
  const coins = prev.coins + Math.floor(xp / 5)
  const next = { ...prev, points, coins, badges: checkBadges({ ...prev, points }) }
  saveLocalProgress(next)
  return next
}

export function loseHeart(prev: ProgressState): ProgressState {
  const hearts = Math.max(0, prev.hearts - 1)
  const next = { ...prev, hearts }
  saveLocalProgress(next)
  return next
}

export function calculateLevel(points: number): number {
  if (points < 100) return 1
  if (points < 300) return 2
  if (points < 600) return 3
  if (points < 1000) return 4
  if (points < 1500) return 5
  return Math.floor(points / 300) + 1
}

export function getLeague(points: number): { name: string; emoji: string; color: string } {
  if (points >= 2000) return { name: 'Diamant', emoji: '💎', color: '#1CB0F6' }
  if (points >= 1000) return { name: 'Gold', emoji: '🥇', color: '#FFD700' }
  if (points >= 500)  return { name: 'Silber', emoji: '🥈', color: '#C0C0C0' }
  if (points >= 100)  return { name: 'Bronze', emoji: '🥉', color: '#CD7F32' }
  return { name: 'Anfänger', emoji: '🌱', color: '#58CC02' }
}

// ── Cloud sync ──────────────────────────────────────────────

export async function loadCloudProgress(userId: string): Promise<ProgressState | null> {
  if (!supabase) return null
  try {
    const { data } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (!data) return null
    return {
      completion: data.completion ?? 0,
      points: data.points ?? 0,
      streak: data.streak ?? 0,
      badges: data.badges ?? [],
      hearts: data.hearts ?? MAX_HEARTS,
      coins: (data as Record<string, unknown>).coins as number ?? 0,
      lastActive: data.last_active ?? null,
      completedLessons: (data as Record<string, unknown>).completed_lessons as string[] ?? [],
      claimedMissions: (data as Record<string, unknown>).claimed_missions as string[] ?? [],
    }
  } catch {
    return null
  }
}

export async function saveCloudProgress(userId: string, p: ProgressState) {
  if (!supabase) return
  try {
    await supabase.from('user_progress').upsert({
      user_id: userId,
      completion: p.completion,
      points: p.points,
      streak: p.streak,
      badges: p.badges,
      hearts: p.hearts,
      coins: p.coins,
      last_active: p.lastActive,
      completed_lessons: p.completedLessons,
      claimed_missions: p.claimedMissions,
      updated_at: new Date().toISOString(),
    })
  } catch {
    // ignore cloud errors
  }
}

export async function syncProgress(userId: string, local: ProgressState): Promise<ProgressState> {
  const cloud = await loadCloudProgress(userId)
  if (!cloud) return local

  // merge: take highest values
  const merged: ProgressState = {
    completion: Math.max(local.completion, cloud.completion),
    points: Math.max(local.points, cloud.points),
    streak: Math.max(local.streak, cloud.streak),
    badges: Array.from(new Set([...local.badges, ...cloud.badges])),
    hearts: Math.max(local.hearts, cloud.hearts),
    coins: Math.max(local.coins, cloud.coins),
    lastActive: local.lastActive && cloud.lastActive
      ? (local.lastActive > cloud.lastActive ? local.lastActive : cloud.lastActive)
      : local.lastActive ?? cloud.lastActive,
    completedLessons: Array.from(new Set([...local.completedLessons, ...cloud.completedLessons])),
    claimedMissions: Array.from(new Set([...local.claimedMissions, ...cloud.claimedMissions])),
  }
  merged.completion = merged.completedLessons.length / totalLessons

  return merged
}
