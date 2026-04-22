import { useState, useEffect, useCallback, useRef } from 'react'
import { getLessonById } from '../data/lessons'
import type { ProgressState } from '../services/progressService'
import { MAX_HEARTS } from '../services/progressService'

type Props = {
  progress: ProgressState
  onComplete: (lessonId: string, xpReward: number, heartsLost: number) => void
  onExit: () => void
}

// Confetti particle
type Piece = { id: number; x: number; color: string; size: number; delay: number; duration: number }

function Confetti() {
  const [pieces, setPieces] = useState<Piece[]>([])
  useEffect(() => {
    const colors = ['#FF4B4B', '#58CC02', '#FFC800', '#1CB0F6', '#CE82FF', '#FF9600']
    const ps: Piece[] = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[i % colors.length],
      size: 6 + Math.random() * 8,
      delay: Math.random() * 1.2,
      duration: 2.5 + Math.random() * 1.5,
    }))
    setPieces(ps)
  }, [])

  return (
    <>
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.x}%`,
            top: '-20px',
            width: p.size,
            height: p.size,
            background: p.color,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            borderRadius: p.id % 3 === 0 ? '50%' : 3,
          }}
        />
      ))}
    </>
  )
}

export default function LessonPage({ progress, onComplete, onExit }: Props) {
  // Extract lessonId from URL
  const lessonId = window.location.pathname.split('/lesson/')[1] ?? ''
  const lesson = getLessonById(lessonId)

  const [stepIdx, setStepIdx] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [tfAnswer, setTfAnswer] = useState<boolean | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [orderItems, setOrderItems] = useState<number[]>([])
  const [hearts, setHearts] = useState(progress.hearts)
  const [heartsLost, setHeartsLost] = useState(0)
  const [showComplete, setShowComplete] = useState(false)
  const [alreadyCompleted] = useState(() => progress.completedLessons.includes(lessonId))
  const dragRef = useRef<number | null>(null)

  const step = lesson?.steps[stepIdx]
  const totalSteps = lesson?.steps.length ?? 1
  const progressPct = totalSteps > 1 ? (stepIdx / (totalSteps - 1)) * 100 : 0

  // Init ordering items
  useEffect(() => {
    if (step?.type === 'ordering') {
      const indices = step.items.map((_, i) => i)
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]]
      }
      setOrderItems(indices)
    }
    setSelected(null)
    setTfAnswer(null)
    setShowFeedback(false)
  }, [stepIdx])

  const goNext = useCallback(() => {
    if (!lesson) return
    if (stepIdx + 1 >= totalSteps) {
      setShowComplete(true)
      return
    }
    setStepIdx(s => s + 1)
    setSelected(null)
    setTfAnswer(null)
    setShowFeedback(false)
  }, [stepIdx, totalSteps, lesson])

  const handleMultiChoice = (idx: number) => {
    if (showFeedback || !step || step.type !== 'multiple-choice') return
    setSelected(idx)
    const correct = idx === step.correctIndex
    setIsCorrect(correct)
    if (!correct && !alreadyCompleted) {
      setHearts(h => Math.max(0, h - 1))
      setHeartsLost(hl => hl + 1)
    }
    setShowFeedback(true)
  }

  const handleTF = (answer: boolean) => {
    if (showFeedback || !step || step.type !== 'true-false') return
    setTfAnswer(answer)
    const correct = answer === step.correct
    setIsCorrect(correct)
    if (!correct && !alreadyCompleted) {
      setHearts(h => Math.max(0, h - 1))
      setHeartsLost(hl => hl + 1)
    }
    setShowFeedback(true)
  }

  const handleOrderingCheck = () => {
    if (!step || step.type !== 'ordering') return
    const correct = orderItems.every((item, idx) => item === step.correctOrder[idx])
    setIsCorrect(correct)
    if (!correct && !alreadyCompleted) {
      setHearts(h => Math.max(0, h - 1))
      setHeartsLost(hl => hl + 1)
    }
    setShowFeedback(true)
  }

  const moveItem = (from: number, to: number) => {
    if (showFeedback) return
    const arr = [...orderItems]
    const [el] = arr.splice(from, 1)
    arr.splice(to, 0, el)
    setOrderItems(arr)
  }

  const handleFinish = () => {
    if (!lesson) return
    onComplete(lesson.id, lesson.xpReward, heartsLost)
    onExit()
  }

  if (!lesson) {
    return (
      <div className="lesson-page" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>Lektion nicht gefunden</div>
          <button className="main-btn red" style={{ marginTop: 20 }} onClick={onExit}>Zurück</button>
        </div>
      </div>
    )
  }

  // COMPLETE SCREEN
  if (showComplete) {
    const xpEarned = alreadyCompleted ? 0 : lesson.xpReward
    return (
      <div className="lesson-page">
        <Confetti />
        <div className="complete-screen">
          <div className="complete-trophy">🏆</div>
          <div className="complete-title">Super gemacht!</div>
          <div className="complete-subtitle">
            Du hast „{lesson.title}" erfolgreich abgeschlossen.
          </div>
          <div className="complete-stats">
            <div className="complete-stat">
              <div className="complete-stat-icon">⭐</div>
              <div className="complete-stat-val">+{xpEarned}</div>
              <div className="complete-stat-lbl">XP verdient</div>
            </div>
            <div className="complete-stat">
              <div className="complete-stat-icon">❤️</div>
              <div className="complete-stat-val">{hearts}</div>
              <div className="complete-stat-lbl">Herzen übrig</div>
            </div>
            <div className="complete-stat">
              <div className="complete-stat-icon">✅</div>
              <div className="complete-stat-val">{totalSteps - 2}</div>
              <div className="complete-stat-lbl">Fragen</div>
            </div>
          </div>
          <button className="main-btn green" style={{ width: '100%' }} onClick={handleFinish}>
            Weiter →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="lesson-page">
      {/* Top bar */}
      <div className="lesson-topbar">
        <button className="lesson-exit-btn" onClick={onExit} aria-label="Schließen">✕</button>
        <div className="lesson-progress-track">
          <div className="lesson-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="hearts-row">
          {Array.from({ length: MAX_HEARTS }).map((_, i) => (
            <span key={i} className={`heart-icon${i >= hearts ? ' empty' : ''}`}>❤️</span>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="lesson-body">
        {/* INTRO */}
        {step?.type === 'intro' && (
          <div className="slide-intro">
            <span className="intro-emoji">{step.emoji}</span>
            <div className="intro-title">{step.title}</div>
            <div className="intro-subtitle">{step.subtitle}</div>
            <button className="main-btn red" style={{ width: '100%', marginTop: 8 }} onClick={goNext}>
              Los geht's!
            </button>
          </div>
        )}

        {/* TEXT */}
        {step?.type === 'text' && (
          <div className="slide-text" style={{ animation: 'slide-up 0.4s ease' }}>
            {step.emoji && <div className="text-slide-emoji">{step.emoji}</div>}
            <div className="text-slide-title">{step.title}</div>
            <div className={`text-slide-content${step.style === 'info' ? ' info-box' : step.style === 'warning' ? ' warning-box' : ''}`}>
              {step.content}
            </div>
            <button className="main-btn blue" onClick={goNext}>Weiter →</button>
          </div>
        )}

        {/* MULTIPLE CHOICE */}
        {step?.type === 'multiple-choice' && (
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

        {/* TRUE / FALSE */}
        {step?.type === 'true-false' && (
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <div className="question-type-label">Richtig oder Falsch?</div>
            <div className="tf-statement">{step.statement}</div>
            <div className="tf-row">
              <button
                className={`tf-btn true-btn${
                  showFeedback
                    ? step.correct ? ' correct' : tfAnswer === true ? ' wrong' : ''
                    : ''
                }`}
                onClick={() => handleTF(true)}
                disabled={showFeedback}
              >
                <span className="tf-btn-icon">✓</span>
                <span className="tf-btn-text">RICHTIG</span>
              </button>
              <button
                className={`tf-btn false-btn${
                  showFeedback
                    ? !step.correct ? ' correct' : tfAnswer === false ? ' wrong' : ''
                    : ''
                }`}
                onClick={() => handleTF(false)}
                disabled={showFeedback}
              >
                <span className="tf-btn-icon">✗</span>
                <span className="tf-btn-text">FALSCH</span>
              </button>
            </div>
          </div>
        )}

        {/* ORDERING */}
        {step?.type === 'ordering' && (
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
              <button className="main-btn blue" style={{ marginTop: 16 }} onClick={handleOrderingCheck}>
                Prüfen
              </button>
            )}
          </div>
        )}

        {/* COMPLETE step – show automatically */}
        {step?.type === 'complete' && (
          <div className="slide-intro">
            <span className="intro-emoji">🎉</span>
            <div className="intro-title">Lektion fertig!</div>
            <div className="intro-subtitle">Du hast alle Fragen beantwortet.</div>
            <button className="main-btn green" style={{ width: '100%' }} onClick={goNext}>Ergebnisse sehen</button>
          </div>
        )}
      </div>

      {/* Feedback bar */}
      {showFeedback && step && (step.type === 'multiple-choice' || step.type === 'true-false' || step.type === 'ordering') && (
        <div className={`feedback-bar ${isCorrect ? 'correct' : 'wrong'}`}>
          <div className="feedback-emoji">{isCorrect ? '🎉' : '😢'}</div>
          <div className="feedback-title">{isCorrect ? 'Richtig!' : 'Nicht ganz...'}</div>
          <div className="feedback-expl">{step.explanation}</div>
          <button
            className={`feedback-btn`}
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
            Weiter →
          </button>
        </div>
      )}
    </div>
  )
}
