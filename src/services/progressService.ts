import { supabase, isSupabaseConfigured, ACHIEVEMENTS } from '../lib/supabase'

export type ProgressState = {
  completion: number
  points: number
  streak: number
  badges: string[]
  hearts: number
  lastActive: string | null
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
    lastActive: null,
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
    lastActive: data.last_active,
  }
}

// Save progress to Supabase
export async function saveCloudProgress(
  userId: string,
  progress: ProgressState
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
      last_active: progress.lastActive,
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
  localProgress: ProgressState
): Promise<ProgressState> {
  if (!isSupabaseConfigured()) {
    return localProgress
  }

  const cloudProgress = await loadCloudProgress(userId)

  if (!cloudProgress) {
    // No cloud progress, upload local
    await saveCloudProgress(userId, localProgress)
    return localProgress
  }

  // Merge: take the better values (higher XP, streak, completion)
  // Use cloud lastActive as source of truth for streak calculation
  const merged: ProgressState = {
    completion: Math.max(localProgress.completion, cloudProgress.completion),
    points: Math.max(localProgress.points, cloudProgress.points),
    streak: cloudProgress.streak, // Use cloud streak as source of truth
    hearts: cloudProgress.hearts, // Use cloud hearts (more recent state)
    badges: [...new Set([...localProgress.badges, ...cloudProgress.badges])],
    lastActive: cloudProgress.lastActive, // Use cloud lastActive
  }

  // Save merged progress
  await saveCloudProgress(userId, merged)
  saveLocalProgress(merged)

  return merged
}

// Update streak based on last active date
export function calculateStreak(lastActive: string | null, currentStreak: number): { streak: number; isNewDay: boolean } {
  const today = new Date().toISOString().slice(0, 10)

  // First time user or no lastActive
  if (!lastActive) {
    return { streak: 1, isNewDay: true }
  }

  // Already visited today
  if (lastActive === today) {
    return { streak: currentStreak, isNewDay: false }
  }

  // Calculate days difference
  const lastDate = new Date(lastActive)
  const todayDate = new Date(today)
  const diffTime = todayDate.getTime() - lastDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) {
    // Consecutive day - increment streak
    return { streak: currentStreak + 1, isNewDay: true }
  } else if (diffDays > 1) {
    // Missed days - reset streak to 1
    return { streak: 1, isNewDay: true }
  }

  // Same day (shouldn't happen but handle edge case)
  return { streak: currentStreak, isNewDay: false }
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
