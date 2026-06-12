import { supabase } from '../lib/supabase'

export const LIGA_TIERS = ['bronze', 'silber', 'gold', 'platin', 'diamant'] as const
export type LigaTier = typeof LIGA_TIERS[number]

export const LIGA_INFO: Record<LigaTier, { name: string; emoji: string; color: string; gradient: string }> = {
  bronze:  { name: 'Bronze',  emoji: '🥉', color: '#CD7F32', gradient: 'linear-gradient(135deg, #CD7F32 0%, #A0522D 100%)' },
  silber:  { name: 'Silber',  emoji: '🥈', color: '#A8A8A8', gradient: 'linear-gradient(135deg, #C0C0C0 0%, #888888 100%)' },
  gold:    { name: 'Gold',    emoji: '🥇', color: '#FFD700', gradient: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)' },
  platin:  { name: 'Platin',  emoji: '💠', color: '#00BFFF', gradient: 'linear-gradient(135deg, #00BFFF 0%, #007BFF 100%)' },
  diamant: { name: 'Diamant', emoji: '💎', color: '#9B59B6', gradient: 'linear-gradient(135deg, #9B59B6 0%, #1CB0F6 100%)' },
}

// Zone boundaries (group of up to 30 players)
export const PROMOTION_CUTOFF = 10  // rank 1–10 promoted
export const STAY_CUTOFF = 20       // rank 11–20 stay; 21+ relegated
export const GROUP_SIZE = 30

export type LeaderboardEntry = {
  user_id: string
  display_name: string
  avatar_url: string | null
  weekly_xp: number
  position: number
}

export type LeagueStatus = {
  tier: LigaTier
  group_id: string
  weekly_xp: number
  season_end: string
}

export type SeasonResult = {
  processed: boolean
  result?: 'promoted' | 'stayed' | 'relegated'
  new_tier?: LigaTier
}

export function getZone(rank: number): 'promotion' | 'stay' | 'relegation' {
  if (rank <= PROMOTION_CUTOFF) return 'promotion'
  if (rank <= STAY_CUTOFF) return 'stay'
  return 'relegation'
}

export function getNextTier(tier: LigaTier): LigaTier | null {
  const idx = LIGA_TIERS.indexOf(tier)
  return idx < LIGA_TIERS.length - 1 ? LIGA_TIERS[idx + 1] : null
}

export function getPrevTier(tier: LigaTier): LigaTier | null {
  const idx = LIGA_TIERS.indexOf(tier)
  return idx > 0 ? LIGA_TIERS[idx - 1] : null
}

// Returns the season end time as a human-readable countdown string
export function formatTimeLeft(seasonEnd: string): string {
  const diff = new Date(seasonEnd).getTime() - Date.now()
  if (diff <= 0) return 'Abgelaufen'
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  if (days > 0) return `${days}T ${hours}h ${String(mins).padStart(2, '0')}m`
  if (hours > 0) return `${hours}h ${String(mins).padStart(2, '0')}m`
  return `${mins}m`
}

// Ensure user is in an active league group; returns their status
export async function getOrJoinLeague(userId: string): Promise<LeagueStatus | null> {
  if (!supabase) return null
  try {
    const { data, error } = await supabase.rpc('get_or_join_league_group', { p_user_id: userId })
    if (error) throw error
    return data as LeagueStatus
  } catch (e) {
    console.error('getOrJoinLeague:', e)
    return null
  }
}

// Fetch the full sorted leaderboard for a group
export async function fetchLeagueLeaderboard(groupId: string): Promise<LeaderboardEntry[]> {
  if (!supabase) return []
  try {
    const { data, error } = await supabase.rpc('get_league_leaderboard', { p_group_id: groupId })
    if (error) throw error
    return (data as LeaderboardEntry[]) ?? []
  } catch (e) {
    console.error('fetchLeagueLeaderboard:', e)
    return []
  }
}

// Add XP to the user's weekly league counter (fire-and-forget)
export async function addLeagueXp(userId: string, xp: number): Promise<void> {
  if (!supabase || xp <= 0) return
  try {
    await supabase.rpc('increment_league_xp', { p_user_id: userId, p_xp: xp })
  } catch {
    // ignore
  }
}

// Check if season has ended, process promotion/demotion if so
export async function checkAndProcessSeason(userId: string): Promise<SeasonResult> {
  if (!supabase) return { processed: false }
  try {
    const { data, error } = await supabase.rpc('process_season_end_if_needed', { p_user_id: userId })
    if (error) throw error
    const d = data as { result: string | null; new_tier: string | null }
    if (!d?.result) return { processed: false }
    return {
      processed: true,
      result: d.result as 'promoted' | 'stayed' | 'relegated',
      new_tier: d.new_tier as LigaTier,
    }
  } catch (e) {
    console.error('checkAndProcessSeason:', e)
    return { processed: false }
  }
}
