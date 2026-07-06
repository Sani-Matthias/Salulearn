import { supabase } from '../lib/supabase'
import { totalLessons } from '../data/lessons'
import type { ShopItem } from '../data/shopCatalog'

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
  lastHeartRegenAt: string | null // ISO timestamp when regen cycle started; null when hearts are full
  inventory: string[]              // owned shop item IDs
  equippedFrame: string | null     // equipped avatar frame item ID
  equippedTheme: string | null     // equipped app theme item ID
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
    lastHeartRegenAt: null,
    inventory: [],
    equippedFrame: null,
    equippedTheme: null,
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
  heartsLost: number = 0,
  isPro: boolean = false
): ProgressState {
  if (prev.completedLessons.includes(lessonId)) return prev

  const completedLessons = [...prev.completedLessons, lessonId]
  const completion = completedLessons.length / totalLessons
  const gainedXp = isPro ? Math.floor(xpReward * 1.5) : xpReward
  const points = prev.points + gainedXp
  const hearts = isPro ? prev.hearts : Math.max(0, Math.min(MAX_HEARTS, prev.hearts - heartsLost))
  const lastHeartRegenAt = hearts < MAX_HEARTS && !prev.lastHeartRegenAt
    ? new Date().toISOString()
    : prev.lastHeartRegenAt
  const coins = prev.coins + Math.floor(gainedXp / 5)

  const today = getLocalToday()
  const { streak, isNewDay } = calculateStreak(prev.lastActive, prev.streak)

  const next: ProgressState = {
    ...prev,
    completedLessons,
    completion,
    points,
    hearts,
    lastHeartRegenAt,
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

export function addTrainingXp(prev: ProgressState, xp: number, isPro: boolean = false): ProgressState {
  if (xp <= 0) return prev
  const gainedXp = isPro ? Math.floor(xp * 1.5) : xp
  const points = prev.points + gainedXp
  const coins = prev.coins + Math.floor(gainedXp / 5)
  const next = { ...prev, points, coins, badges: checkBadges({ ...prev, points }) }
  saveLocalProgress(next)
  return next
}

// ── Shop ────────────────────────────────────────────────────

export function purchaseItem(prev: ProgressState, item: ShopItem): ProgressState {
  if (prev.inventory.includes(item.id)) return prev
  if (item.proOnly || prev.coins < item.price) return prev

  const next: ProgressState = {
    ...prev,
    coins: prev.coins - item.price,
    inventory: [...prev.inventory, item.id],
  }
  saveLocalProgress(next)
  return next
}

export function equipItem(
  prev: ProgressState,
  type: 'frame' | 'theme',
  itemId: string | null,
  owned: boolean
): ProgressState {
  if (itemId && !owned) return prev

  const next: ProgressState = type === 'frame'
    ? { ...prev, equippedFrame: itemId }
    : { ...prev, equippedTheme: itemId }
  saveLocalProgress(next)
  return next
}

export function loseHeart(prev: ProgressState): ProgressState {
  const hearts = Math.max(0, prev.hearts - 1)
  const lastHeartRegenAt = hearts < MAX_HEARTS && !prev.lastHeartRegenAt
    ? new Date().toISOString()
    : prev.lastHeartRegenAt
  const next = { ...prev, hearts, lastHeartRegenAt }
  saveLocalProgress(next)
  return next
}

export function applyHeartRegen(prev: ProgressState): ProgressState {
  if (prev.hearts >= MAX_HEARTS || !prev.lastHeartRegenAt) return prev

  const elapsed = Date.now() - new Date(prev.lastHeartRegenAt).getTime()
  const heartsToAdd = Math.floor(elapsed / 3_600_000)
  if (heartsToAdd === 0) return prev

  const hearts = Math.min(MAX_HEARTS, prev.hearts + heartsToAdd)
  const lastHeartRegenAt = hearts >= MAX_HEARTS
    ? null
    : new Date(new Date(prev.lastHeartRegenAt).getTime() + heartsToAdd * 3_600_000).toISOString()

  const next = { ...prev, hearts, lastHeartRegenAt }
  saveLocalProgress(next)
  return next
}

// Returns seconds until the next heart regenerates, or null if hearts are full
export function secondsUntilNextHeart(prev: ProgressState): number | null {
  if (prev.hearts >= MAX_HEARTS || !prev.lastHeartRegenAt) return null
  const elapsed = Date.now() - new Date(prev.lastHeartRegenAt).getTime()
  return Math.max(0, 3600 - Math.floor((elapsed % 3_600_000) / 1000))
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
      lastHeartRegenAt: (data as Record<string, unknown>).last_heart_regen_at as string ?? null,
      inventory: (data as Record<string, unknown>).inventory as string[] ?? [],
      equippedFrame: (data as Record<string, unknown>).equipped_frame as string ?? null,
      equippedTheme: (data as Record<string, unknown>).equipped_theme as string ?? null,
    }
  } catch (err) {
    console.error('loadCloudProgress failed:', err)
    return null
  }
}

export async function saveCloudProgress(userId: string, p: ProgressState) {
  if (!supabase) return
  try {
    const { error } = await supabase.from('user_progress').upsert({
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
      last_heart_regen_at: p.lastHeartRegenAt,
      inventory: p.inventory,
      equipped_frame: p.equippedFrame,
      equipped_theme: p.equippedTheme,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' })

    if (error) console.error('saveCloudProgress failed:', error)
  } catch (err) {
    console.error('saveCloudProgress failed:', err)
  }
}

export async function syncProgress(userId: string, local: ProgressState): Promise<ProgressState> {
  const cloud = await loadCloudProgress(userId)
  if (!cloud) return local

  // merge: take highest values
  const mergedHearts = Math.max(local.hearts, cloud.hearts)
  // For lastHeartRegenAt: take earliest non-null timestamp (more regen credit for the user)
  const localT = local.lastHeartRegenAt
  const cloudT = cloud.lastHeartRegenAt
  const mergedLastHeartRegenAt = mergedHearts >= MAX_HEARTS
    ? null
    : localT && cloudT
      ? (localT < cloudT ? localT : cloudT)
      : localT ?? cloudT

  const merged: ProgressState = {
    completion: Math.max(local.completion, cloud.completion),
    points: Math.max(local.points, cloud.points),
    streak: Math.max(local.streak, cloud.streak),
    badges: Array.from(new Set([...local.badges, ...cloud.badges])),
    hearts: mergedHearts,
    lastHeartRegenAt: mergedLastHeartRegenAt,
    coins: Math.max(local.coins, cloud.coins),
    lastActive: local.lastActive && cloud.lastActive
      ? (local.lastActive > cloud.lastActive ? local.lastActive : cloud.lastActive)
      : local.lastActive ?? cloud.lastActive,
    completedLessons: Array.from(new Set([...local.completedLessons, ...cloud.completedLessons])),
    claimedMissions: Array.from(new Set([...local.claimedMissions, ...cloud.claimedMissions])),
    inventory: Array.from(new Set([...local.inventory, ...cloud.inventory])),
    equippedFrame: local.equippedFrame ?? cloud.equippedFrame,
    equippedTheme: local.equippedTheme ?? cloud.equippedTheme,
  }
  merged.completion = merged.completedLessons.length / totalLessons

  return merged
}
