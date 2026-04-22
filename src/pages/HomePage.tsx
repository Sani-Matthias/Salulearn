import { useState } from 'react'
import { modules } from '../data/lessons'
import type { ProgressState } from '../services/progressService'

type Props = {
  progress: ProgressState
  onStartLesson: (lessonId: string) => void
}

export default function HomePage({ progress, onStartLesson }: Props) {
  const [lockedPop, setLockedPop] = useState<string | null>(null)

  const completedSet = new Set(progress.completedLessons)
  const allLessons = modules.flatMap(m => m.lessons)

  const getStatus = (lessonId: string): 'completed' | 'active' | 'locked' => {
    if (completedSet.has(lessonId)) return 'completed'
    const idx = allLessons.findIndex(l => l.id === lessonId)
    if (idx === 0) return 'active'
    const prev = allLessons[idx - 1]
    if (prev && completedSet.has(prev.id)) return 'active'
    return 'locked'
  }

  const handleNodeClick = (lessonId: string) => {
    const status = getStatus(lessonId)
    if (status === 'locked') {
      setLockedPop(lessonId)
      setTimeout(() => setLockedPop(null), 1800)
      return
    }
    onStartLesson(lessonId)
  }

  let globalLessonIdx = 0

  return (
    <div className="path-page">
      {modules.map((mod, modIdx) => {
        const modLessons = mod.lessons
        const completedInMod = modLessons.filter(l => completedSet.has(l.id)).length
        const progressPct = completedInMod / modLessons.length

        return (
          <div key={mod.id} className="module-section">
            {/* Module connector between modules */}
            {modIdx > 0 && (
              <div className="module-connector">
                <div className="module-connector-line" />
              </div>
            )}

            {/* Module banner */}
            <div
              className="module-banner"
              style={{ background: `linear-gradient(135deg, ${mod.color} 0%, ${mod.colorDark} 100%)` }}
            >
              <div className="module-banner-section">Modul {modIdx + 1}</div>
              <div className="module-banner-title">{mod.emoji} {mod.title}</div>
              <div className="module-banner-desc">{mod.description}</div>
              <div className="module-banner-progress">
                <div
                  className="module-banner-progress-fill"
                  style={{ width: `${progressPct * 100}%` }}
                />
              </div>
            </div>

            {/* Lesson nodes */}
            <div className="lesson-nodes-row">
              {modLessons.map((lesson) => {
                globalLessonIdx++
                const status = getStatus(lesson.id)
                const isLocked = lockedPop === lesson.id

                return (
                  <div
                    key={lesson.id}
                    className={`lesson-node-item${status === 'locked' ? ' locked' : ''}`}
                    onClick={() => handleNodeClick(lesson.id)}
                    title={status === 'locked' ? 'Schließe zuerst die vorherige Lektion ab' : lesson.title}
                  >
                    <div className={`lesson-node-circle ${status}`}>
                      <span style={{ fontSize: 32 }}>
                        {status === 'completed' ? '✓' : status === 'locked' ? '🔒' : lesson.emoji}
                      </span>
                      {status === 'completed' && (
                        <div className="node-checkmark" style={{ background: '#58CC02', color: 'white', fontSize: 12 }}>✓</div>
                      )}
                    </div>
                    <div className={`lesson-node-title${status === 'locked' ? ' locked' : ''}`}>
                      {isLocked ? '🔒 Gesperrt' : lesson.title}
                    </div>
                    <div className={`lesson-node-xp${status === 'locked' ? ' locked' : ''}`}>
                      +{lesson.xpReward} XP
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
        globalLessonIdx
      })}

      {/* Completion banner */}
      {progress.completedLessons.length === allLessons.length && (
        <div
          style={{
            margin: '24px 0',
            padding: '28px 20px',
            borderRadius: 24,
            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
            textAlign: 'center',
            color: 'white',
          }}
        >
          <div style={{ fontSize: 56, marginBottom: 12 }}>🏆</div>
          <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 8 }}>Kurs abgeschlossen!</div>
          <div style={{ fontSize: 16, fontWeight: 600, opacity: 0.9 }}>
            Du hast alle 30 Lektionen gemeistert. Du bist ein Erste-Hilfe-Experte!
          </div>
        </div>
      )}

      {/* Bottom spacer for nav */}
      <div style={{ height: 20 }} />
    </div>
  )
}
