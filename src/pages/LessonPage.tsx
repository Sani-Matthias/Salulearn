import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getLessonById } from '../data/lessons'

type LessonPageProps = {
  onCompleteMission: (rewardPoints?: number, completionBoost?: number) => void
  onWrongTry: () => void
}

function LessonPage({ onCompleteMission, onWrongTry }: LessonPageProps) {
  const { lessonId } = useParams<{ lessonId: string }>()
  const navigate = useNavigate()
  const lesson = getLessonById(lessonId || '')

  const [currentStep, setCurrentStep] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [orderItems, setOrderItems] = useState<number[]>([])
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  // Rhythm game state
  const [rhythmActive, setRhythmActive] = useState(false)
  const [rhythmTaps, setRhythmTaps] = useState<number[]>([])
  const [rhythmScore, setRhythmScore] = useState<number | null>(null)
  const [rhythmTimeLeft, setRhythmTimeLeft] = useState(0)
  const rhythmStartTime = useRef<number>(0)
  const rhythmTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const step = lesson?.steps[currentStep]

  // Initialize ordering question
  useEffect(() => {
    if (step?.type === 'ordering') {
      const indices = step.items.map((_, i) => i)
      // Shuffle
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indices[i], indices[j]] = [indices[j], indices[i]]
      }
      setOrderItems(indices)
    }
  }, [currentStep, step])

  // Cleanup rhythm timer
  useEffect(() => {
    return () => {
      if (rhythmTimerRef.current) {
        clearInterval(rhythmTimerRef.current)
      }
    }
  }, [])

  const handleNext = useCallback(() => {
    if (!lesson) return

    setSelectedAnswer(null)
    setShowResult(false)
    setIsCorrect(false)
    setRhythmActive(false)
    setRhythmTaps([])
    setRhythmScore(null)

    if (currentStep < lesson.steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Lesson complete
      onCompleteMission(lesson.xpReward, 0.05)
      navigate('/')
    }
  }, [currentStep, lesson, navigate, onCompleteMission])

  const handleMultipleChoice = (index: number) => {
    if (showResult || !step || step.type !== 'multiple-choice') return

    setSelectedAnswer(index)
    setShowResult(true)
    const correct = index === step.correctIndex
    setIsCorrect(correct)

    if (!correct) {
      onWrongTry()
    }
  }

  const handleTrueFalse = (answer: boolean) => {
    if (showResult || !step || step.type !== 'true-false') return

    setSelectedAnswer(answer ? 1 : 0)
    setShowResult(true)
    const correct = answer === step.correct
    setIsCorrect(correct)

    if (!correct) {
      onWrongTry()
    }
  }

  const handleOrderingSubmit = () => {
    if (!step || step.type !== 'ordering') return

    setShowResult(true)
    const correct = orderItems.every((item, idx) => item === step.correctOrder[idx])
    setIsCorrect(correct)

    if (!correct) {
      onWrongTry()
    }
  }

  const moveOrderItem = (fromIndex: number, toIndex: number) => {
    if (showResult) return
    const newOrder = [...orderItems]
    const [removed] = newOrder.splice(fromIndex, 1)
    newOrder.splice(toIndex, 0, removed)
    setOrderItems(newOrder)
  }

  const startRhythm = () => {
    if (!step || step.type !== 'rhythm') return

    setRhythmActive(true)
    setRhythmTaps([])
    setRhythmScore(null)
    setRhythmTimeLeft(step.duration)
    rhythmStartTime.current = Date.now()

    rhythmTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - rhythmStartTime.current) / 1000
      const remaining = Math.max(0, step.duration - elapsed)
      setRhythmTimeLeft(Math.ceil(remaining))

      if (remaining <= 0) {
        if (rhythmTimerRef.current) {
          clearInterval(rhythmTimerRef.current)
        }
        finishRhythm()
      }
    }, 100)
  }

  const handleRhythmTap = () => {
    if (!rhythmActive || !step || step.type !== 'rhythm') return

    const now = Date.now()
    setRhythmTaps(prev => [...prev, now])
  }

  const finishRhythm = () => {
    if (!step || step.type !== 'rhythm') return

    setRhythmActive(false)

    // Calculate score based on rhythm consistency
    if (rhythmTaps.length < 5) {
      setRhythmScore(0)
      setShowResult(true)
      setIsCorrect(false)
      onWrongTry()
      return
    }

    const intervals: number[] = []
    for (let i = 1; i < rhythmTaps.length; i++) {
      intervals.push(rhythmTaps[i] - rhythmTaps[i - 1])
    }

    const targetInterval = 60000 / step.bpm // ms between beats
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length

    // Score based on how close to target BPM
    const bpmAccuracy = Math.max(0, 100 - Math.abs(avgInterval - targetInterval) / targetInterval * 100)

    // Score based on consistency (standard deviation)
    const variance = intervals.reduce((sum, int) => sum + Math.pow(int - avgInterval, 2), 0) / intervals.length
    const stdDev = Math.sqrt(variance)
    const consistencyScore = Math.max(0, 100 - (stdDev / avgInterval) * 100)

    const finalScore = Math.round((bpmAccuracy * 0.6 + consistencyScore * 0.4))
    setRhythmScore(finalScore)
    setShowResult(true)
    setIsCorrect(finalScore >= 60)

    if (finalScore < 60) {
      onWrongTry()
    }
  }

  if (!lesson) {
    return (
      <div className="lesson-container">
        <div className="card lesson-card">
          <h2>Lektion nicht gefunden</h2>
          <button className="cta primary" onClick={() => navigate('/')}>
            Zurueck zum Lernpfad
          </button>
        </div>
      </div>
    )
  }

  const progress = ((currentStep + 1) / lesson.steps.length) * 100

  return (
    <div className="lesson-container">
      <div className="lesson-header">
        <button className="lesson-close" onClick={() => navigate('/')}>
          ✕
        </button>
        <div className="lesson-progress-bar">
          <div className="lesson-progress-fill" style={{ width: `${progress}%` }} />
        </div>
        <div className="lesson-xp">
          <span className="lesson-icon">{lesson.icon}</span>
          <span>+{lesson.xpReward} XP</span>
        </div>
      </div>

      <div className="card lesson-card">
        {step?.type === 'text' && (
          <div className="lesson-text">
            <h2>{step.title}</h2>
            <p className="lesson-content">{step.content}</p>
            <button className="cta primary lesson-next" onClick={handleNext}>
              Weiter
            </button>
          </div>
        )}

        {step?.type === 'multiple-choice' && (
          <div className="lesson-quiz">
            <h2>{step.question}</h2>
            <div className="quiz-options">
              {step.options.map((option, index) => (
                <button
                  key={index}
                  className={`quiz-option ${
                    showResult
                      ? index === step.correctIndex
                        ? 'correct'
                        : selectedAnswer === index
                          ? 'wrong'
                          : ''
                      : selectedAnswer === index
                        ? 'selected'
                        : ''
                  }`}
                  onClick={() => handleMultipleChoice(index)}
                  disabled={showResult}
                >
                  <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                  <span className="option-text">{option}</span>
                </button>
              ))}
            </div>
            {showResult && (
              <div className={`quiz-result ${isCorrect ? 'correct' : 'wrong'}`}>
                <p className="result-title">{isCorrect ? '✓ Richtig!' : '✗ Falsch!'}</p>
                <p className="result-explanation">{step.explanation}</p>
                <button className="cta primary lesson-next" onClick={handleNext}>
                  Weiter
                </button>
              </div>
            )}
          </div>
        )}

        {step?.type === 'true-false' && (
          <div className="lesson-quiz">
            <h2>Richtig oder Falsch?</h2>
            <p className="true-false-statement">{step.statement}</p>
            <div className="true-false-buttons">
              <button
                className={`quiz-option true-btn ${
                  showResult
                    ? step.correct
                      ? 'correct'
                      : selectedAnswer === 1
                        ? 'wrong'
                        : ''
                    : ''
                }`}
                onClick={() => handleTrueFalse(true)}
                disabled={showResult}
              >
                ✓ Richtig
              </button>
              <button
                className={`quiz-option false-btn ${
                  showResult
                    ? !step.correct
                      ? 'correct'
                      : selectedAnswer === 0
                        ? 'wrong'
                        : ''
                    : ''
                }`}
                onClick={() => handleTrueFalse(false)}
                disabled={showResult}
              >
                ✗ Falsch
              </button>
            </div>
            {showResult && (
              <div className={`quiz-result ${isCorrect ? 'correct' : 'wrong'}`}>
                <p className="result-title">{isCorrect ? '✓ Richtig!' : '✗ Falsch!'}</p>
                <p className="result-explanation">{step.explanation}</p>
                <button className="cta primary lesson-next" onClick={handleNext}>
                  Weiter
                </button>
              </div>
            )}
          </div>
        )}

        {step?.type === 'ordering' && (
          <div className="lesson-ordering">
            <h2>{step.question}</h2>
            <div className="ordering-list">
              {orderItems.map((itemIndex, position) => (
                <div
                  key={itemIndex}
                  className={`ordering-item ${
                    showResult
                      ? step.correctOrder[position] === itemIndex
                        ? 'correct'
                        : 'wrong'
                      : ''
                  } ${draggedIndex === position ? 'dragging' : ''}`}
                  draggable={!showResult}
                  onDragStart={() => setDraggedIndex(position)}
                  onDragEnd={() => setDraggedIndex(null)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => {
                    if (draggedIndex !== null) {
                      moveOrderItem(draggedIndex, position)
                    }
                  }}
                >
                  <span className="ordering-number">{position + 1}</span>
                  <span className="ordering-text">{step.items[itemIndex]}</span>
                  {!showResult && (
                    <div className="ordering-arrows">
                      <button
                        className="arrow-btn"
                        onClick={() => position > 0 && moveOrderItem(position, position - 1)}
                        disabled={position === 0}
                      >
                        ▲
                      </button>
                      <button
                        className="arrow-btn"
                        onClick={() => position < orderItems.length - 1 && moveOrderItem(position, position + 1)}
                        disabled={position === orderItems.length - 1}
                      >
                        ▼
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {!showResult && (
              <button className="cta primary lesson-next" onClick={handleOrderingSubmit}>
                Pruefen
              </button>
            )}
            {showResult && (
              <div className={`quiz-result ${isCorrect ? 'correct' : 'wrong'}`}>
                <p className="result-title">{isCorrect ? '✓ Richtig!' : '✗ Falsch!'}</p>
                <p className="result-explanation">{step.explanation}</p>
                <button className="cta primary lesson-next" onClick={handleNext}>
                  Weiter
                </button>
              </div>
            )}
          </div>
        )}

        {step?.type === 'rhythm' && (
          <div className="lesson-rhythm">
            <h2>{step.title}</h2>
            <p className="rhythm-instruction">{step.instruction}</p>

            {!rhythmActive && rhythmScore === null && (
              <div className="rhythm-start">
                <div className="rhythm-info">
                  <p>Ziel: {step.bpm} BPM</p>
                  <p>Dauer: {step.duration} Sekunden</p>
                </div>
                <button className="cta primary rhythm-start-btn" onClick={startRhythm}>
                  Start
                </button>
              </div>
            )}

            {rhythmActive && (
              <div className="rhythm-game">
                <div className="rhythm-timer">{rhythmTimeLeft}s</div>
                <button
                  className="rhythm-tap-btn"
                  onClick={handleRhythmTap}
                  onTouchStart={(e) => {
                    e.preventDefault()
                    handleRhythmTap()
                  }}
                >
                  <span className="tap-icon">❤️</span>
                  <span className="tap-text">TAP!</span>
                </button>
                <div className="rhythm-count">Taps: {rhythmTaps.length}</div>
              </div>
            )}

            {showResult && rhythmScore !== null && (
              <div className={`quiz-result ${isCorrect ? 'correct' : 'wrong'}`}>
                <p className="result-title">
                  {isCorrect ? '✓ Gut gemacht!' : '✗ Versuch es nochmal!'}
                </p>
                <div className="rhythm-score">
                  <span className="score-value">{rhythmScore}%</span>
                  <span className="score-label">Rhythmus-Score</span>
                </div>
                <p className="result-explanation">
                  {rhythmScore >= 80
                    ? 'Exzellent! Du hast den perfekten CPR-Rhythmus!'
                    : rhythmScore >= 60
                      ? 'Gut! Dein Rhythmus war akzeptabel.'
                      : 'Uebe weiter! Versuche gleichmaessiger zu tippen.'}
                </p>
                <button className="cta primary lesson-next" onClick={handleNext}>
                  Weiter
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default LessonPage
