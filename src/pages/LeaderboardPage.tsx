import { useAuth } from '../contexts/AuthContext'
import type { ProgressState } from '../services/progressService'
import { getLeague, calculateLevel } from '../services/progressService'

type Props = { progress: ProgressState }

// Simulated leaderboard data
const mockPlayers = [
  { name: 'SaraS', xp: 4200, avatar: '👩‍🏫' },
  { name: 'MaxM', xp: 3850, avatar: '🧑‍🚒' },
  { name: 'LisaK', xp: 3100, avatar: '👩‍⚕️' },
  { name: 'TomH', xp: 2750, avatar: '🧑‍🎓' },
  { name: 'AnnaB', xp: 2400, avatar: '👩' },
  { name: 'KarlF', xp: 2100, avatar: '👨' },
  { name: 'MiaW', xp: 1800, avatar: '🧑' },
  { name: 'BenJ', xp: 1500, avatar: '👦' },
  { name: 'LeoP', xp: 1200, avatar: '🧒' },
]

const RANK_MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default function LeaderboardPage({ progress }: Props) {
  const { profile, user } = useAuth()
  const myXp = progress.points
  const myName = profile?.display_name || user?.email?.split('@')[0] || 'Du'
  const league = getLeague(myXp)
  const level = calculateLevel(myXp)

  const allPlayers = [
    ...mockPlayers,
    { name: myName, xp: myXp, avatar: '😊', isMe: true },
  ].sort((a, b) => b.xp - a.xp)

  const myRank = allPlayers.findIndex(p => (p as { isMe?: boolean }).isMe) + 1

  const leagueGradients: Record<string, string> = {
    'Diamant': 'linear-gradient(135deg, #1CB0F6 0%, #0090D4 100%)',
    'Gold':    'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
    'Silber':  'linear-gradient(135deg, #C0C0C0 0%, #888888 100%)',
    'Bronze':  'linear-gradient(135deg, #CD7F32 0%, #A0522D 100%)',
    'Anfänger':'linear-gradient(135deg, #58CC02 0%, #46A302 100%)',
  }

  return (
    <div className="leaderboard-page">
      <div className="lb-hero">
        <div className="lb-title">Rangliste 🏆</div>
        <div className="lb-subtitle">Wöchentliche XP-Wertung</div>
      </div>

      {/* League card */}
      <div
        className="league-card"
        style={{ background: leagueGradients[league.name] || leagueGradients['Anfänger'] }}
      >
        <div className="league-icon-xl">{league.emoji}</div>
        <div>
          <div className="league-card-name">{league.name}-Liga</div>
          <div className="league-card-desc">
            Du bist auf Platz {myRank} • Level {level} • {myXp} XP
          </div>
        </div>
      </div>

      {/* Top 3 podium */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        gap: 8,
        margin: '16px 0 20px',
        padding: '0 8px',
      }}>
        {[allPlayers[1], allPlayers[0], allPlayers[2]].filter(Boolean).map((p, i) => {
          const rank = [2, 1, 3][i]
          const heights = [80, 110, 60]
          const isMe = (p as { isMe?: boolean }).isMe
          return (
            <div key={p.name} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ fontSize: rank === 1 ? 32 : 24 }}>{(p as { avatar: string }).avatar}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: isMe ? 'var(--success-dark)' : 'var(--text)', textAlign: 'center' }}>
                {p.name.length > 8 ? p.name.slice(0, 7) + '…' : p.name}
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--info)' }}>{p.xp} XP</div>
              <div style={{
                width: '100%',
                height: heights[i],
                borderRadius: '12px 12px 0 0',
                background: rank === 1 ? '#FFD700' : rank === 2 ? '#C0C0C0' : '#CD7F32',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 28,
                fontWeight: 900,
                color: 'white',
              }}>
                {RANK_MEDAL[rank] || rank}
              </div>
            </div>
          )
        })}
      </div>

      {/* Full list */}
      <div className="lb-list">
        {allPlayers.map((p, idx) => {
          const rank = idx + 1
          const isMe = (p as { isMe?: boolean }).isMe
          const rankClass = rank === 1 ? 'r1' : rank === 2 ? 'r2' : rank === 3 ? 'r3' : ''
          return (
            <div key={p.name + rank} className={`lb-item${isMe ? ' me' : ''}`}>
              <div className={`lb-rank ${rankClass}`}>
                {RANK_MEDAL[rank] || rank}
              </div>
              <div className="lb-avatar">
                {(p as { avatar: string }).avatar}
              </div>
              <div className="lb-name">
                {p.name} {isMe && '(Du)'}
              </div>
              <div className="lb-xp">{p.xp} XP</div>
            </div>
          )
        })}
      </div>

      {!user && (
        <div style={{
          margin: '20px 0',
          padding: '16px',
          background: 'var(--surface)',
          borderRadius: 16,
          textAlign: 'center',
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--text-muted)',
          lineHeight: 1.6,
        }}>
          💡 Erstelle ein Konto, um in der echten Rangliste zu erscheinen und mit anderen zu konkurrieren!
        </div>
      )}

      <div style={{ height: 20 }} />
    </div>
  )
}
