import ProgressRing from '../components/ProgressRing'
import type { ProgressState } from '../App'

type LearnPageProps = {
  progress: ProgressState
  onCompleteMission: (rewardPoints?: number, completionBoost?: number, coinReward?: number, missionId?: string) => void
  onWrongTry: () => void
}

// Daily missions based on real progress
function getDailyMissions(progress: ProgressState) {
  return [
    {
      id: 'daily-xp',
      label: 'Verdiene 50 XP heute',
      current: Math.min(progress.points % 100, 50),
      total: 50,
      reward: 30,
      pflaster: 5,
    },
    {
      id: 'daily-lesson',
      label: 'Schliesse 1 Lektion ab',
      current: progress.completedLessons.length > 0 ? 1 : 0,
      total: 1,
      reward: 40,
      pflaster: 10,
    },
    {
      id: 'daily-streak',
      label: 'Halte deinen Streak',
      current: progress.streak > 0 ? 1 : 0,
      total: 1,
      reward: 20,
      pflaster: 5,
    },
  ]
}

// Monthly missions based on real progress
function getMonthlyMissions(progress: ProgressState) {
  return [
    {
      id: 'month-xp',
      label: 'Sammle 500 XP',
      current: Math.min(progress.points, 500),
      total: 500,
      reward: 100,
      pflaster: 50,
    },
    {
      id: 'month-streak',
      label: 'Erreiche 7 Tage Streak',
      current: Math.min(progress.streak, 7),
      total: 7,
      reward: 80,
      pflaster: 30,
    },
    {
      id: 'month-lessons',
      label: 'Schliesse 5 Lektionen ab',
      current: Math.min(progress.completedLessons.length, 5),
      total: 5,
      reward: 120,
      pflaster: 60,
    },
  ]
}

function LearnPage({ progress, onCompleteMission }: LearnPageProps) {
  const dailyMissions = getDailyMissions(progress)
  const monthlyMissions = getMonthlyMissions(progress)

  // Calculate next reward (only unclaimed missions)
  const nextMission = [...dailyMissions, ...monthlyMissions].find(
    (m) => m.current >= m.total && !progress.claimedMissions.includes(m.id)
  )

  return (
    <div className="missions-layout">
      <div className="missions-main">
        <div className="progress-summary card">
          <ProgressRing progress={progress.completion} label="Kurs" />
          <div className="mini-stat">
            <p className="eyebrow">Naechste Belohnung</p>
            <p className="stat-value">
              {nextMission ? `+${nextMission.reward} XP` : 'Weiter lernen!'}
            </p>
            <p className="stat-sub">
              {nextMission
                ? `${nextMission.label} abgeschlossen`
                : 'Schliesse eine Mission ab'}
            </p>
          </div>
        </div>

        {/* Daily Missions */}
        <section className="card monthly-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Taegliche Missionen</p>
              <h3>Heute erledigen</h3>
            </div>
          </div>
          <ul className="monthly-list">
            {dailyMissions.map((mission) => {
              const pct = Math.min(100, Math.round((mission.current / mission.total) * 100))
              const isComplete = mission.current >= mission.total
              const isClaimed = progress.claimedMissions.includes(mission.id)
              return (
                <li key={mission.id} className="monthly-item">
                  <div>
                    <p className="mission-title">{mission.label}</p>
                    <p className="mission-meta">
                      {isClaimed ? '✅ Eingeloest' : `${mission.current} / ${mission.total}`}
                    </p>
                    <div className="rail-progress">
                      <div className="rail-progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  {isClaimed ? (
                    <button className="cta secondary claimed" disabled>
                      Erhalten
                    </button>
                  ) : (
                    <button
                      className={`cta secondary ${isComplete ? 'claimable' : ''}`}
                      onClick={() => onCompleteMission(mission.reward, 0.02, mission.pflaster, mission.id)}
                      disabled={!isComplete}
                    >
                      {isComplete ? (
                        <span>
                          Einloesen
                          <span className="coin-reward">+{mission.pflaster} 🩹</span>
                        </span>
                      ) : (
                        `+${mission.reward} XP`
                      )}
                    </button>
                  )}
                </li>
              )
            })}
          </ul>
        </section>

        {/* Monthly Missions */}
        <section className="card monthly-card">
          <div className="card-header">
            <div>
              <p className="eyebrow">Monatliche Missionen</p>
              <h3>Langfristige Ziele</h3>
            </div>
          </div>
          <ul className="monthly-list">
            {monthlyMissions.map((mission) => {
              const pct = Math.min(100, Math.round((mission.current / mission.total) * 100))
              const isComplete = mission.current >= mission.total
              const isClaimed = progress.claimedMissions.includes(mission.id)
              return (
                <li key={mission.id} className="monthly-item">
                  <div>
                    <p className="mission-title">{mission.label}</p>
                    <p className="mission-meta">
                      {isClaimed ? '✅ Eingeloest' : `${mission.current} / ${mission.total}`}
                    </p>
                    <div className="rail-progress">
                      <div className="rail-progress-fill" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  {isClaimed ? (
                    <button className="cta secondary claimed" disabled>
                      Erhalten
                    </button>
                  ) : (
                    <button
                      className={`cta secondary ${isComplete ? 'claimable' : ''}`}
                      onClick={() => onCompleteMission(mission.reward, 0.05, mission.pflaster, mission.id)}
                      disabled={!isComplete}
                    >
                      {isComplete ? (
                        <span>
                          Einloesen
                          <span className="coin-reward">+{mission.pflaster} 🩹</span>
                        </span>
                      ) : (
                        `+${mission.reward} XP`
                      )}
                    </button>
                  )}
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
