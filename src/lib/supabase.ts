import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Supabase credentials not found. Running in offline mode. ' +
    'To enable cloud sync, add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
  )
}

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export const isSupabaseConfigured = () => !!supabase

// Database types
export type Profile = {
  id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type UserProgress = {
  id: string
  user_id: string
  completion: number
  points: number
  streak: number
  hearts: number
  badges: string[]
  last_active: string | null
  created_at: string
  updated_at: string
}

export type Achievement = {
  id: string
  user_id: string
  achievement_type: string
  unlocked_at: string
}

// Achievement types
export const ACHIEVEMENTS = {
  FIRST_LOGIN: { id: 'first_login', name: 'Willkommen!', description: 'Erstelle dein Konto', icon: '🎉' },
  STREAK_3: { id: 'streak_3', name: 'Auf dem Weg', description: '3 Tage Streak', icon: '🔥' },
  STREAK_7: { id: 'streak_7', name: 'Eine Woche!', description: '7 Tage Streak', icon: '⭐' },
  STREAK_30: { id: 'streak_30', name: 'Unaufhaltsam', description: '30 Tage Streak', icon: '🏆' },
  XP_100: { id: 'xp_100', name: 'Lernender', description: '100 XP gesammelt', icon: '📚' },
  XP_500: { id: 'xp_500', name: 'Fleissig', description: '500 XP gesammelt', icon: '💪' },
  XP_1000: { id: 'xp_1000', name: 'Experte', description: '1000 XP gesammelt', icon: '🎓' },
  FIRST_MISSION: { id: 'first_mission', name: 'Erster Schritt', description: 'Erste Mission abgeschlossen', icon: '✅' },
  HALF_COMPLETE: { id: 'half_complete', name: 'Halbzeit!', description: '50% des Kurses abgeschlossen', icon: '🌟' },
  FULL_HEARTS: { id: 'full_hearts', name: 'Perfektionist', description: 'Alle 5 Herzen behalten', icon: '❤️' },
} as const
