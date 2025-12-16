import { supabase, isSupabaseConfigured, ACHIEVEMENTS } from '../lib/supabase'

export type ProgressState = {
  completion: number
  points: number
  streak: number
  badges: string[]
  hearts: number
}

const STORAGE_KEY = 'salu-progress-v1'

// Load progress from localStorage
export function loadLocalProgress(): ProgressState {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    try {
      return JSON.parse(stored) as ProgressState
    } catch {
      console.error('Failed to parse local progress')
    }
  }
  return getDefaultProgress()
}

// Save progress to localStorage
export function saveLocalProgress(progress: ProgressState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

// Get default progress state
export function getDefaultProgress(): ProgressState {
  return {
    completion: 0,
    points: 0,
    streak: 0,
    badges: [],
    hearts: 5,
  }
}

// Load progress from Supabase
export async function loadCloudProgress(userId: string): Promise<ProgressState | null> {
  if (!supabase || !isSupabaseConfigured()) return null

  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No progress found, create new
      return null
    }
    console.error('Error loading cloud progress:', error)
    return null
  }

  return {
    completion: data.completion,
    points: data.points,
    streak: data.streak,
    badges: data.badges || [],
    hearts: data.hearts,
  }
}

// Save progress to Supabase
export async function saveCloudProgress(
  userId: string,
  progress: ProgressState,
  lastActive: string
): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured()) return false

  const { error } = await supabase
    .from('user_progress')
    .upsert({
      user_id: userId,
      completion: progress.completion,
      points: progress.points,
      streak: progress.streak,
      badges: progress.badges,
      hearts: progress.hearts,
      last_active: lastActive,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id',
    })

  if (error) {
    console.error('Error saving cloud progress:', error)
    return false
  }

  return true
}

// Sync local and cloud progress (cloud takes precedence if newer)
export async function syncProgress(
  userId: string,
  localProgress: ProgressState,
  lastActive: string
): Promise<ProgressState> {
  if (!isSupabaseConfigured()) {
    return localProgress
  }

  const cloudProgress = await loadCloudProgress(userId)

  if (!cloudProgress) {
    // No cloud progress, upload local
    await saveCloudProgress(userId, localProgress, lastActive)
    return localProgress
  }

  // Merge: take the better values (higher XP, streak, completion)
  const merged: ProgressState = {
    completion: Math.max(localProgress.completion, cloudProgress.completion),
    points: Math.max(localProgress.points, cloudProgress.points),
    streak: Math.max(localProgress.streak, cloudProgress.streak),
    hearts: cloudProgress.hearts, // Use cloud hearts (more recent state)
    badges: [...new Set([...localProgress.badges, ...cloudProgress.badges])],
  }

  // Save merged progress
  await saveCloudProgress(userId, merged, lastActive)
  saveLocalProgress(merged)

  return merged
}

// Check and unlock achievements
export async function checkAchievements(
  userId: string,
  progress: ProgressState
): Promise<string[]> {
  if (!supabase || !isSupabaseConfigured()) return []

  const newAchievements: string[] = []

  // Get existing achievements
  const { data: existingAchievements } = await supabase
    .from('achievements')
    .select('achievement_type')
    .eq('user_id', userId)

  const unlockedTypes = new Set(existingAchievements?.map(a => a.achievement_type) || [])

  // Check each achievement
  const checks: { type: string; condition: boolean }[] = [
    { type: ACHIEVEMENTS.FIRST_LOGIN.id, condition: true },
    { type: ACHIEVEMENTS.STREAK_3.id, condition: progress.streak >= 3 },
    { type: ACHIEVEMENTS.STREAK_7.id, condition: progress.streak >= 7 },
    { type: ACHIEVEMENTS.STREAK_30.id, condition: progress.streak >= 30 },
    { type: ACHIEVEMENTS.XP_100.id, condition: progress.points >= 100 },
    { type: ACHIEVEMENTS.XP_500.id, condition: progress.points >= 500 },
    { type: ACHIEVEMENTS.XP_1000.id, condition: progress.points >= 1000 },
    { type: ACHIEVEMENTS.HALF_COMPLETE.id, condition: progress.completion >= 0.5 },
    { type: ACHIEVEMENTS.FULL_HEARTS.id, condition: progress.hearts === 5 },
  ]

  for (const check of checks) {
    if (check.condition && !unlockedTypes.has(check.type)) {
      const { error } = await supabase
        .from('achievements')
        .insert({
          user_id: userId,
          achievement_type: check.type,
        })

      if (!error) {
        newAchievements.push(check.type)
      }
    }
  }

  return newAchievements
}

// Get all achievements for a user
export async function getUserAchievements(userId: string): Promise<string[]> {
  if (!supabase || !isSupabaseConfigured()) return []

  const { data, error } = await supabase
    .from('achievements')
    .select('achievement_type')
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching achievements:', error)
    return []
  }

  return data.map(a => a.achievement_type)
}

// Calculate level based on XP
export function calculateLevel(xp: number): { level: number; currentXp: number; nextLevelXp: number } {
  // XP needed per level increases: 100, 200, 300, etc.
  let level = 1
  let totalXpNeeded = 0
  let xpForCurrentLevel = 100

  while (totalXpNeeded + xpForCurrentLevel <= xp) {
    totalXpNeeded += xpForCurrentLevel
    level++
    xpForCurrentLevel = level * 100
  }

  return {
    level,
    currentXp: xp - totalXpNeeded,
    nextLevelXp: xpForCurrentLevel,
  }
}

// Get league based on XP
export function getLeague(xp: number): { name: string; icon: string; color: string } {
  if (xp >= 5000) return { name: 'Diamant', icon: '💎', color: 'diamond' }
  if (xp >= 2500) return { name: 'Gold', icon: '🥇', color: 'gold' }
  if (xp >= 1000) return { name: 'Silber', icon: '🥈', color: 'silver' }
  if (xp >= 500) return { name: 'Bronze', icon: '🥉', color: 'bronze' }
  return { name: 'Starter', icon: '🌱', color: 'starter' }
}
