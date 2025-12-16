import ProgressRing from '../components/ProgressRing'
import type { ProgressState } from '../App'

type LearnPageProps = {
  progress: ProgressState
  onCompleteMission: (rewardPoints?: number, completionBoost?: number) => void
  onWrongTry: () => void
}

const pathNodes = [
  { id: 'intro', label: '112 anrufen', status: 'done', icon: '📞', xp: 50 },
  { id: 'airway', label: 'Atmung checken', status: 'done', icon: '💨', xp: 60 },
  { id: 'side', label: 'Stabile Seitenlage', status: 'active', icon: '🛏️', xp: 70 },
  { id: 'cpr', label: 'Herzdruckmassage', status: 'locked', icon: '❤️', xp: 80 },
  { id: 'allergy', label: 'Allergie', status: 'locked', icon: '💊', xp: 75 },
]

const monthlyMissions = [
  { id: 'month-xp', label: 'Sammle 500 XP', current: 240, total: 500, reward: 80 },
  { id: 'month-streak', label: 'Halte 15 Tage Streak', current: 8, total: 15, reward: 60 },
  { id: 'month-hearts', label: 'Verliere weniger als 5 Hearts', current: 1, total: 5, reward: 40 },
]

function LearnPage({ progress, onCompleteMission, onWrongTry }: LearnPageProps) {
  return (
    <div className="lesson-layout">
      <div className="lesson-main">
        <section className="card lesson-status">
          <div className="path">
            {pathNodes.map((node) => (
              <div key={node.id} className={`path-node ${node.status}`}>
                <div className="path-dot-connector" />
                <div className="path-dot">
                  <span className="path-icon">
                    {node.status === 'done' ? '✓' : node.status === 'active' ? node.icon : '🔒'}
                  </span>
                </div>
                <div className="path-label">
                  <p className="mission-title">{node.label}</p>
                  <p className="mission-meta">
                    {node.status === 'active'
                      ? `🎯 Aktuell · +${node.xp} XP`
                      : node.status === 'done'
                        ? `✅ Fertig · +${node.xp} XP`
                        : `🔒 Gesperrt · +${node.xp} XP`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="lesson-side">
        <div className="progress-summary card">
          <ProgressRing progress={progress.completion} label="Kurs" />
          <div className="mini-stat">
            <p className="eyebrow">Naechste Belohnung</p>
            <p className="stat-value">+50 XP</p>
            <p className="stat-sub">Schliesse 1 Mission ab</p>
          </div>
        </div>
        <section className="card monthly-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Monatliche Missionen</p>
              <h3>Langfristige Ziele</h3>
            </div>
            <button className="cta tiny ghost" onClick={onWrongTry}>
              Test: Herz verlieren
            </button>
          </div>
          <ul className="monthly-list">
            {monthlyMissions.map((mission) => {
              const pct = Math.min(100, Math.round((mission.current / mission.total) * 100))
              const isComplete = mission.current >= mission.total
              return (
                <li key={mission.id} className="monthly-item">
                  <div>
                    <p className="mission-title">{mission.label}</p>
                    <p className="mission-meta">
                      {mission.current} / {mission.total}
                    </p>
                    <div className="rail-progress">
                      <div className="rail-progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <button
                    className={`cta secondary ${isComplete ? 'claimable' : ''}`}
                    onClick={() => onCompleteMission(mission.reward, 0.03)}
                    disabled={!isComplete}
                  >
                    {isComplete ? 'Einloesen' : `+${mission.reward} XP`}
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </div>
  )
}

export default LearnPage
