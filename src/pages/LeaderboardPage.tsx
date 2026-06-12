import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import type { ProgressState } from '../services/progressService'
import {
  LIGA_INFO,
  LIGA_TIERS,
  PROMOTION_CUTOFF,
  STAY_CUTOFF,
  getZone,
  getNextTier,
  getPrevTier,
  formatTimeLeft,
  getOrJoinLeague,
  fetchLeagueLeaderboard,
  checkAndProcessSeason,
} from '../services/leagueService'
import type { LeaderboardEntry, LeagueStatus, SeasonResult, LigaTier } from '../services/leagueService'

type Props = { progress: ProgressState }

// Demo data for logged-out users
const DEMO_PLAYERS: LeaderboardEntry[] = [
  { user_id: '1', display_name: 'SaraS',   avatar_url: null, weekly_xp: 420, position: 1 },
  { user_id: '2', display_name: 'MaxM',    avatar_url: null, weekly_xp: 385, position: 2 },
  { user_id: '3', display_name: 'LisaK',   avatar_url: null, weekly_xp: 310, position: 3 },
  { user_id: '4', display_name: 'TomH',    avatar_url: null, weekly_xp: 275, position: 4 },
  { user_id: '5', display_name: 'AnnaB',   avatar_url: null, weekly_xp: 240, position: 5 },
  { user_id: '6', display_name: 'KarlF',   avatar_url: null, weekly_xp: 210, position: 6 },
  { user_id: '7', display_name: 'MiaW',    avatar_url: null, weekly_xp: 180, position: 7 },
  { user_id: '8', display_name: 'BenJ',    avatar_url: null, weekly_xp: 150, position: 8 },
  { user_id: '9', display_name: 'LeoP',    avatar_url: null, weekly_xp: 120, position: 9 },
  { user_id: '10', display_name: 'EvaR',   avatar_url: null, weekly_xp: 90,  position: 10 },
  { user_id: '11', display_name: 'JanS',   avatar_url: null, weekly_xp: 75,  position: 11 },
  { user_id: '12', display_name: 'PetraM', avatar_url: null, weekly_xp: 60,  position: 12 },
  { user_id: '13', display_name: 'OliK',   avatar_url: null, weekly_xp: 45,  position: 13 },
  { user_id: '14', display_name: 'MarcL',  avatar_url: null, weekly_xp: 30,  position: 14 },
  { user_id: '15', display_name: 'NinaF',  avatar_url: null, weekly_xp: 20,  position: 15 },
]

const MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }
const AVATARS = ['🧑', '👩', '👨', '🧒', '👦', '👧', '🧑‍🎓', '👩‍🏫', '🧑‍🚒', '👩‍⚕️']
const getAvatar = (entry: LeaderboardEntry, idx: number) =>
  entry.avatar_url ? null : AVATARS[idx % AVATARS.length]

function SeasonBanner({ result, newTier }: { result: SeasonResult['result']; newTier?: LigaTier }) {
  if (!result) return null
  const info = newTier ? LIGA_INFO[newTier] : null
  const configs = {
    promoted:  { bg: '#D4EDDA', color: '#155724', icon: '⬆️', text: `Aufgestiegen in die ${info?.name}-Liga!` },
    relegated: { bg: '#F8D7DA', color: '#721C24', icon: '⬇️', text: `Abgestiegen in die ${info?.name}-Liga.` },
    stayed:    { bg: '#FFF3CD', color: '#856404', icon: '➡️', text: 'Saison beendet – gleiche Liga.' },
  }
  const cfg = configs[result]
  return (
    <div style={{
      background: cfg.bg, color: cfg.color,
      borderRadius: 14, padding: '12px 16px',
      fontWeight: 700, fontSize: 14,
      display: 'flex', alignItems: 'center', gap: 8,
      marginBottom: 12,
    }}>
      <span style={{ fontSize: 20 }}>{cfg.icon}</span>
      {cfg.text}
    </div>
  )
}

function ZoneDivider({ label, icon, color }: { label: string; icon: string; color: string }) {
  return (
    <div className="lb-zone-divider" style={{ color }}>
      <span>{icon}</span>
      <span>{label}</span>
      <span>{icon}</span>
    </div>
  )
}

export default function LeaderboardPage({ progress }: Props) {
  const { user, isOnlineMode } = useAuth()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<LeagueStatus | null>(null)
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [seasonResult, setSeasonResult] = useState<SeasonResult | null>(null)
  const [timeLeft, setTimeLeft] = useState('')

  const loadLeague = useCallback(async () => {
    if (!user || !isOnlineMode) return
    setLoading(true)
    try {
      // 1. Process season end if it has passed
      const result = await checkAndProcessSeason(user.id)
      if (result?.processed) setSeasonResult(result)

      // 2. Ensure user is in a group (creates one if needed)
      const st = await getOrJoinLeague(user.id)
      setStatus(st)

      // 3. Fetch leaderboard
      if (st?.group_id) {
        const lb = await fetchLeagueLeaderboard(st.group_id)
        setEntries(lb)
      }
    } finally {
      setLoading(false)
    }
  }, [user, isOnlineMode])

  useEffect(() => {
    loadLeague()
  }, [loadLeague])

  // Countdown timer
  useEffect(() => {
    if (!status?.season_end) return
    const update = () => setTimeLeft(formatTimeLeft(status.season_end))
    update()
    const id = setInterval(update, 30000)
    return () => clearInterval(id)
  }, [status?.season_end])

  const isLoggedIn = !!user
  const isOnline = isLoggedIn && isOnlineMode

  // Decide what to display
  const displayEntries: (LeaderboardEntry & { isMe?: boolean })[] = isOnline
    ? entries.map(e => ({ ...e, isMe: e.user_id === user?.id }))
    : DEMO_PLAYERS

  const currentTier: LigaTier = (status?.tier ?? 'bronze') as LigaTier
  const ligaInfo = LIGA_INFO[currentTier]
  const myEntry = displayEntries.find(e => e.isMe)
  const myRank = myEntry ? myEntry.position : null
  const myWeeklyXp = isOnline ? (status?.weekly_xp ?? 0) : progress.points

  const nextTier = getNextTier(currentTier)
  const prevTier = getPrevTier(currentTier)

  // Group entries by zone
  const promotionEntries = displayEntries.filter(e => e.position <= PROMOTION_CUTOFF)
  const stayEntries = displayEntries.filter(e => e.position > PROMOTION_CUTOFF && e.position <= STAY_CUTOFF)
  const relegationEntries = displayEntries.filter(e => e.position > STAY_CUTOFF)

  const renderEntry = (e: typeof displayEntries[0], idx: number) => {
    const rank = e.position
    const isMe = e.isMe
    const zone = getZone(rank)
    const avatar = getAvatar(e, idx)
    return (
      <div
        key={e.user_id}
        className={`lb-item${isMe ? ' me' : ''} lb-zone-${zone}`}
      >
        <div className={`lb-rank${rank <= 3 ? ` r${rank}` : ''}`}>
          {MEDAL[rank] ?? rank}
        </div>
        <div className="lb-avatar">
          {e.avatar_url
            ? <img src={e.avatar_url} alt="" />
            : avatar}
        </div>
        <div className="lb-name">
          {e.display_name}
          {isMe && <span className="lb-me-badge">Du</span>}
        </div>
        <div className="lb-xp">{e.weekly_xp} XP</div>
      </div>
    )
  }

  return (
    <div className="leaderboard-page">
      <div className="lb-hero">
        <div className="lb-title">Rangliste 🏆</div>
        <div className="lb-subtitle">Wöchentliche Liga</div>
      </div>

      {/* Season result banner (shown once after season processed) */}
      {seasonResult?.processed && (
        <SeasonBanner result={seasonResult.result} newTier={seasonResult.new_tier} />
      )}

      {/* League tier card */}
      <div className="league-card" style={{ background: ligaInfo.gradient }}>
        <div className="league-icon-xl">{ligaInfo.emoji}</div>
        <div style={{ flex: 1 }}>
          <div className="league-card-name">{ligaInfo.name}-Liga</div>
          <div className="league-card-desc">
            {myRank ? `Platz ${myRank} • ` : ''}{myWeeklyXp} XP diese Woche
          </div>
          {timeLeft && (
            <div className="league-card-desc" style={{ marginTop: 2 }}>
              ⏳ Saison endet in {timeLeft}
            </div>
          )}
        </div>
        {/* Liga tier indicator */}
        <div className="lb-tier-ladder">
          {[...LIGA_TIERS].reverse().map(t => (
            <div
              key={t}
              className="lb-tier-dot"
              style={{
                background: t === currentTier ? 'white' : 'rgba(255,255,255,0.3)',
                transform: t === currentTier ? 'scale(1.4)' : 'scale(1)',
              }}
              title={LIGA_INFO[t].name}
            />
          ))}
        </div>
      </div>

      {/* Promotion/relegation info */}
      <div className="lb-zone-legend">
        {nextTier && (
          <div className="lb-zone-legend-item promotion">
            ⬆️ Top 10 → {LIGA_INFO[nextTier].name}
          </div>
        )}
        <div className="lb-zone-legend-item stay">
          ➡️ Platz 11–20 bleibt
        </div>
        {prevTier && (
          <div className="lb-zone-legend-item relegation">
            ⬇️ Platz 21–30 → {LIGA_INFO[prevTier].name}
          </div>
        )}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="lb-skeleton" />
          ))}
        </div>
      )}

      {/* Leaderboard with zones */}
      {!loading && (
        <div className="lb-list">
          {promotionEntries.length > 0 && (
            <>
              <ZoneDivider label="Aufstieg" icon="⬆️" color="#28a745" />
              {promotionEntries.map((e, i) => renderEntry(e, i))}
            </>
          )}
          {stayEntries.length > 0 && (
            <>
              <ZoneDivider label="Bleibt" icon="➡️" color="#6c757d" />
              {stayEntries.map((e, i) => renderEntry(e, promotionEntries.length + i))}
            </>
          )}
          {relegationEntries.length > 0 && (
            <>
              <ZoneDivider label="Abstieg" icon="⬇️" color="#dc3545" />
              {relegationEntries.map((e, i) => renderEntry(e, promotionEntries.length + stayEntries.length + i))}
            </>
          )}
        </div>
      )}

      {/* Offline / not logged in notice */}
      {!isOnline && (
        <div className="lb-offline-notice">
          {!isLoggedIn
            ? '💡 Erstelle ein Konto, um in einer echten Liga zu konkurrieren!'
            : '📡 Offline – Liga nicht verfügbar.'}
        </div>
      )}

      <div style={{ height: 20 }} />
    </div>
  )
}
