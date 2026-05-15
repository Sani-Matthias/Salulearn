import { useState, useRef, useEffect, useCallback } from 'react'
import type { LessonStep } from '../data/lessons'
import { allLessons } from '../data/lessons'
import type { ProgressState } from '../services/progressService'

type QuestionStep =
  | Extract<LessonStep, { type: 'multiple-choice' }>
  | Extract<LessonStep, { type: 'true-false' }>
  | Extract<LessonStep, { type: 'ordering' }>

type TrainingQ = {
  step: QuestionStep
  lessonEmoji: string
  lessonTitle: string
}

type Props = {
  progress: ProgressState
  onExit: () => void
  onXpEarned: (xp: number) => void
}

const XP_PER_CORRECT = 2

function buildPool(completedIds: string[]): TrainingQ[] {
  const pool: TrainingQ[] = []
  for (const lesson of allLessons) {
    if (!completedIds.includes(lesson.id)) continue
    for (const step of lesson.steps) {
      if (step.type === 'multiple-choice' || step.type === 'true-false' || step.type === 'ordering') {
        pool.push({ step: step as QuestionStep, lessonEmoji: lesson.emoji, lessonTitle: lesson.title })
      }
    }
  }
  return pool
}

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function TrainingPage({ progress, onExit, onXpEarned }: Props) {
  const pool = buildPool(progress.completedLessons)

  const [phase, setPhase] = useState<'lobby' | 'quiz' | 'results'>('lobby')
  const [sessionSize, setSessionSize] = useState(10)
  const [questions, setQuestions] = useState<TrainingQ[]>([])
  const [qIdx, setQIdx] = useState(0)
  const [correct, setCorrect] = useState(0)

  const [selected, setSelected] = useState<number | null>(null)
  const [tfAnswer, setTfAnswer] = useState<boolean | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [orderItems, setOrderItems] = useState<number[]>([])
  const dragRef = useRef<number | null>(null)

  const current = questions[qIdx]

  useEffect(() => {
    if (!current) return
    if (current.step.type === 'ordering') {
      const orderStep = current.step
      const indices = orderStep.items.map((_, i) => i)
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]]
      }
      setOrderItems(indices)
    }
    setSelected(null)
    setTfAnswer(null)
    setShowFeedback(false)
  }, [qIdx, questions])

  const startSession = (size: number) => {
    const qs = shuffled(pool).slice(0, size)
    setQuestions(qs)
    setQIdx(0)
    setCorrect(0)
    setSelected(null)
    setTfAnswer(null)
    setShowFeedback(false)
    setPhase('quiz')
  }

  const goNext = useCallback(() => {
    if (qIdx + 1 >= questions.length) {
      const xp = correct * XP_PER_CORRECT
      onXpEarned(xp)
      setPhase('results')
    } else {
      setQIdx(i => i + 1)
    }
  }, [qIdx, questions.length, correct, onXpEarned])

  const handleMultiChoice = (idx: number) => {
    if (showFeedback || !current || current.step.type !== 'multiple-choice') return
    setSelected(idx)
    const ok = idx === current.step.correctIndex
    setIsCorrect(ok)
    if (ok) setCorrect(c => c + 1)
    setShowFeedback(true)
  }

  const handleTF = (answer: boolean) => {
    if (showFeedback || !current || current.step.type !== 'true-false') return
    setTfAnswer(answer)
    const ok = answer === current.step.correct
    setIsCorrect(ok)
    if (ok) setCorrect(c => c + 1)
    setShowFeedback(true)
  }

  const handleOrderCheck = () => {
    if (!current || current.step.type !== 'ordering') return
    const orderStep = current.step
    const ok = orderItems.every((item, i) => item === orderStep.correctOrder[i])
    setIsCorrect(ok)
    if (ok) setCorrect(c => c + 1)
    setShowFeedback(true)
  }

  const moveItem = (from: number, to: number) => {
    if (showFeedback) return
    const arr = [...orderItems]
    const [el] = arr.splice(from, 1)
    arr.splice(to, 0, el)
    setOrderItems(arr)
  }

  // ── LOBBY ──────────────────────────────────────────────────
  if (phase === 'lobby') {
    const availableSizes = [5, 10, 15].filter(n => n <= pool.length)
    const effectiveSize = availableSizes.includes(sessionSize)
      ? sessionSize
      : (availableSizes[availableSizes.length - 1] ?? pool.length)

    return (
      <div className="lesson-page" style={{ background: '#fff' }}>
        <div className="lesson-topbar">
          <button className="lesson-exit-btn" onClick={onExit} aria-label="Schließen">✕</button>
          <div style={{ flex: 1, textAlign: 'center', fontWeight: 800, fontSize: 18 }}>🎯 Trainingscenter</div>
          <div style={{ width: 40 }} />
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '24px 20px', gap: 24, overflowY: 'auto' }}>
          {pool.length === 0 ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center' }}>
              <div style={{ fontSize: 64 }}>😅</div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>Noch nichts gelernt!</div>
              <div style={{ fontSize: 15, color: '#777', maxWidth: 280 }}>
                Schließe zuerst einige Lektionen ab – dann kannst du dein Wissen hier trainieren.
              </div>
              <button className="main-btn red" style={{ width: '100%', maxWidth: 320 }} onClick={onExit}>
                Zum Lernen →
              </button>
            </div>
          ) : (
            <>
              <div style={{ background: '#f7f7f7', borderRadius: 20, padding: '24px', textAlign: 'center' }}>
                <div style={{ fontSize: 52 }}>🎯</div>
                <div style={{ fontSize: 24, fontWeight: 900, marginTop: 8 }}>
                  {pool.length} Fragen bereit
                </div>
                <div style={{ fontSize: 14, color: '#888', marginTop: 6 }}>
                  aus {progress.completedLessons.length} abgeschlossenen Lektionen
                </div>
              </div>

              <div>
                <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: '#555' }}>
                  Wie viele Fragen?
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[5, 10, 15].map(n => {
                    const available = n <= pool.length
                    const active = effectiveSize === n
                    return (
                      <button
                        key={n}
                        onClick={() => available && setSessionSize(n)}
                        style={{
                          flex: 1,
                          padding: '16px 0',
                          borderRadius: 16,
                          border: active ? '3px solid #FF4B4B' : '2px solid #e5e5e5',
                          background: active ? '#fff0f0' : available ? '#f7f7f7' : '#f0f0f0',
                          color: available ? (active ? '#FF4B4B' : '#333') : '#ccc',
                          fontWeight: 900,
                          fontSize: 20,
                          cursor: available ? 'pointer' : 'not-allowed',
                          fontFamily: 'inherit',
                          transition: 'all 0.15s',
                        }}
                      >
                        {n}
                        <div style={{ fontSize: 11, fontWeight: 600, marginTop: 2, opacity: available ? 1 : 0.5 }}>
                          {available ? 'Fragen' : '—'}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div style={{ background: '#eaf4ff', borderRadius: 14, padding: '14px 16px', fontSize: 14, color: '#1a5276', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>💡</span>
                <span>
                  Fragen aus allen deinen Lektionen werden zufällig gemischt.
                  Du bekommst <strong>+{XP_PER_CORRECT} XP</strong> pro richtiger Antwort!
                </span>
              </div>

              <button
                className="main-btn red"
                style={{ width: '100%', marginTop: 'auto' }}
                onClick={() => startSession(Math.min(effectiveSize, pool.length))}
              >
                Training starten 💪
              </button>
            </>
          )}
        </div>
      </div>
    )
  }

  // ── RESULTS ─────────────────────────────────────────────────
  if (phase === 'results') {
    const total = questions.length
    const pct = Math.round((correct / total) * 100)
    const xpEarned = correct * XP_PER_CORRECT
    const emoji = pct >= 90 ? '🏆' : pct >= 70 ? '🌟' : pct >= 50 ? '👍' : '💪'
    const msg = pct >= 90 ? 'Hervorragend!' : pct >= 70 ? 'Sehr gut!' : pct >= 50 ? 'Weiter so!' : 'Übe weiter!'
    const ringColor = pct >= 70 ? '#58CC02' : pct >= 50 ? '#FFC800' : '#FF4B4B'

    return (
      <div className="lesson-page">
        <div className="complete-screen" style={{ paddingTop: 32 }}>
          <div className="complete-trophy">{emoji}</div>
          <div className="complete-title">{msg}</div>
          <div style={{ fontSize: 15, color: '#777', marginBottom: 24 }}>
            <strong>{correct}</strong> von <strong>{total}</strong> Fragen richtig
          </div>

          <div style={{
            width: 130, height: 130, borderRadius: '50%',
            background: `conic-gradient(${ringColor} ${pct * 3.6}deg, #e5e5e5 0deg)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 28px',
          }}>
            <div style={{
              width: 98, height: 98, borderRadius: '50%', background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
            }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: ringColor }}>{pct}%</div>
            </div>
          </div>

          <div className="complete-stats">
            <div className="complete-stat">
              <div className="complete-stat-icon">✅</div>
              <div className="complete-stat-val">{correct}</div>
              <div className="complete-stat-lbl">Richtig</div>
            </div>
            <div className="complete-stat">
              <div className="complete-stat-icon">❌</div>
              <div className="complete-stat-val">{total - correct}</div>
              <div className="complete-stat-lbl">Falsch</div>
            </div>
            <div className="complete-stat">
              <div className="complete-stat-icon">⭐</div>
              <div className="complete-stat-val">+{xpEarned}</div>
              <div className="complete-stat-lbl">XP verdient</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%', marginTop: 8 }}>
            <button className="main-btn green" style={{ width: '100%' }}
              onClick={() => startSession(questions.length)}>
              Nochmal trainieren 🔄
            </button>
            <button className="main-btn blue" style={{ width: '100%' }} onClick={onExit}>
              Beenden
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── QUIZ ────────────────────────────────────────────────────
  if (!current) return null
  const { step } = current
  const progressPct = questions.length > 0 ? (qIdx / questions.length) * 100 : 0

  return (
    <div className="lesson-page">
      <div className="lesson-topbar">
        <button className="lesson-exit-btn" onClick={onExit} aria-label="Schließen">✕</button>
        <div className="lesson-progress-track">
          <div className="lesson-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#888', minWidth: 44, textAlign: 'right' }}>
          {qIdx + 1}/{questions.length}
        </div>
      </div>

      <div className="lesson-body">
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: '#f0f0f0', borderRadius: 20, padding: '5px 12px',
          fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 4,
          alignSelf: 'flex-start',
        }}>
          {current.lessonEmoji} {current.lessonTitle}
        </div>

        {step.type === 'multiple-choice' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div className="question-type-label">Wähle die richtige Antwort</div>
            <div className="question-text">{step.question}</div>
            <div className="options-list">
              {step.options.map((opt, i) => {
                let cls = 'option-btn'
                if (showFeedback) {
                  if (i === step.correctIndex) cls += ' correct'
                  else if (i === selected) cls += ' wrong'
                } else if (i === selected) cls += ' selected'
                return (
                  <button key={i} className={cls} onClick={() => handleMultiChoice(i)} disabled={showFeedback}>
                    <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                    <span style={{ flex: 1, textAlign: 'left' }}>{opt}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {step.type === 'true-false' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div className="question-type-label">Richtig oder Falsch?</div>
            <div className="tf-statement">{step.statement}</div>
            <div className="tf-row">
              <button
                className={`tf-btn true-btn${showFeedback ? step.correct ? ' correct' : tfAnswer === true ? ' wrong' : '' : ''}`}
                onClick={() => handleTF(true)}
                disabled={showFeedback}
              >
                <span className="tf-btn-icon">✓</span>
                <span className="tf-btn-text">RICHTIG</span>
              </button>
              <button
                className={`tf-btn false-btn${showFeedback ? !step.correct ? ' correct' : tfAnswer === false ? ' wrong' : '' : ''}`}
                onClick={() => handleTF(false)}
                disabled={showFeedback}
              >
                <span className="tf-btn-icon">✗</span>
                <span className="tf-btn-text">FALSCH</span>
              </button>
            </div>
          </div>
        )}

        {step.type === 'ordering' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div className="question-type-label">Bringe in die richtige Reihenfolge</div>
            <div className="question-text">{step.question}</div>
            <div className="ordering-list">
              {orderItems.map((itemIdx, pos) => {
                const isC = showFeedback && step.correctOrder[pos] === itemIdx
                const isW = showFeedback && step.correctOrder[pos] !== itemIdx
                return (
                  <div
                    key={itemIdx}
                    className={`ordering-item${isC ? ' correct' : isW ? ' wrong' : ''}`}
                    draggable={!showFeedback}
                    onDragStart={() => { dragRef.current = pos }}
                    onDragOver={e => e.preventDefault()}
                    onDrop={() => {
                      if (dragRef.current !== null) moveItem(dragRef.current, pos)
                      dragRef.current = null
                    }}
                    onDragEnd={() => { dragRef.current = null }}
                  >
                    <div className="ordering-num">{pos + 1}</div>
                    <div className="ordering-text">{step.items[itemIdx]}</div>
                    {!showFeedback && (
                      <div className="ordering-arrows">
                        <button className="arrow-btn" disabled={pos === 0} onClick={() => moveItem(pos, pos - 1)}>▲</button>
                        <button className="arrow-btn" disabled={pos === orderItems.length - 1} onClick={() => moveItem(pos, pos + 1)}>▼</button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
            {!showFeedback && (
              <button className="main-btn blue" style={{ marginTop: 16 }} onClick={handleOrderCheck}>
                Prüfen
              </button>
            )}
          </div>
        )}
      </div>

      {showFeedback && (
        <div className={`feedback-bar ${isCorrect ? 'correct' : 'wrong'}`}>
          <div className="feedback-emoji">{isCorrect ? '🎉' : '😢'}</div>
          <div className="feedback-title">{isCorrect ? 'Richtig!' : 'Nicht ganz...'}</div>
          <div className="feedback-expl">{step.explanation}</div>
          <button
            onClick={goNext}
            style={{
              background: isCorrect ? 'var(--success)' : 'var(--primary)',
              color: 'white',
              boxShadow: `0 4px 0 ${isCorrect ? 'var(--success-dark)' : 'var(--primary-dark)'}`,
              borderRadius: 16,
              border: 'none',
              width: '100%',
              padding: '14px',
              fontSize: 17,
              fontWeight: 900,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            {qIdx + 1 < questions.length ? 'Weiter →' : 'Auswertung →'}
          </button>
        </div>
      )}
    </div>
  )
}
