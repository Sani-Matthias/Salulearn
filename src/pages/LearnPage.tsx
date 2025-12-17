import ProgressRing from '../components/ProgressRing'
import type { ProgressState } from '../App'

type LearnPageProps = {
  progress: ProgressState
  onCompleteMission: (rewardPoints?: number, completionBoost?: number) => void
  onWrongTry: () => void
}

const monthlyMissions = [
  { id: 'month-xp', label: 'Sammle 500 XP', current: 240, total: 500, reward: 80 },
  { id: 'month-streak', label: 'Halte 15 Tage Streak', current: 8, total: 15, reward: 60 },
  { id: 'month-hearts', label: 'Verliere weniger als 5 Hearts', current: 1, total: 5, reward: 40 },
]

function LearnPage({ progress, onCompleteMission, onWrongTry }: LearnPageProps) {
  return (
    <div className="missions-layout">
      <div className="missions-main">
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
