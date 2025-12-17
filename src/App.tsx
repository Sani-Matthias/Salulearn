import { useEffect, useMemo, useState, useCallback } from 'react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LearnPage from './pages/LearnPage'
import LessonPage from './pages/LessonPage'
import ProfilePage from './pages/ProfilePage'
import StreakCalendar from './components/StreakCalendar'
import AuthModal from './components/AuthModal'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { syncProgress, loadLocalProgress, saveLocalProgress, saveCloudProgress, calculateStreak, type ProgressState } from './services/progressService'

// Confetti colors
const CONFETTI_COLORS = ['#ff7ab5', '#5cd3ff', '#8fd867', '#9b7bff', '#f7b500', '#f97316']

// Generate random confetti pieces
const generateConfetti = () => {
  return Array.from({ length: 50 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 2,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    size: 8 + Math.random() * 8,
  }))
}

// Re-export ProgressState for backwards compatibility
export type { ProgressState } from './services/progressService'

const today = new Date().toISOString().slice(0, 10)

const defaultProgress: ProgressState = {
  completion: 0,
  points: 0,
  streak: 0,
  badges: [],
  hearts: 5,
  lastActive: null,
}

const dailyMissions = [
  { id: 'xp', label: 'Verdiene 10 XP', current: 0, total: 10, icon: '⭐' },
  { id: 'time', label: 'Lerne 5 Minuten lang', current: 0, total: 5, icon: '⏱️' },
  { id: 'score', label: 'Erreiche 90% in 2 Missionen', current: 0, total: 2, icon: '🎯' },
]

// Inner app component that uses auth context
function AppContent() {
  const { user, profile, isOnlineMode } = useAuth()
  const [progress, setProgress] = useState<ProgressState>(defaultProgress)
  const [showLogin, setShowLogin] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [confettiPieces, setConfettiPieces] = useState<ReturnType<typeof generateConfetti>>([])
  const [toast, setToast] = useState<{ message: string; xp: number } | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [streakUpdated, setStreakUpdated] = useState(false)
  const location = useLocation()

  // Load progress on mount
  useEffect(() => {
    const localProgress = loadLocalProgress()
    if (localProgress) {
      setProgress(localProgress)
    }
  }, [])

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    saveLocalProgress(progress)
  }, [progress])

  // Sync progress with cloud when user logs in and update streak
  useEffect(() => {
    const doSync = async () => {
      if (user && isOnlineMode && !isSyncing && !streakUpdated) {
        setIsSyncing(true)
        try {
          // First sync to get cloud data
          const syncedProgress = await syncProgress(user.id, progress)

          // Calculate streak based on lastActive
          const { streak: newStreak, isNewDay } = calculateStreak(
            syncedProgress.lastActive,
            syncedProgress.streak
          )

          // Update progress with new streak and today's date
          const updatedProgress: ProgressState = {
            ...syncedProgress,
            streak: newStreak,
            lastActive: isNewDay ? today : syncedProgress.lastActive,
          }

          setProgress(updatedProgress)

          // Save updated progress if it's a new day
          if (isNewDay) {
            await saveCloudProgress(user.id, updatedProgress)
            saveLocalProgress(updatedProgress)
          }

          setStreakUpdated(true)
        } catch (error) {
          console.error('Sync error:', error)
        }
        setIsSyncing(false)
      }
    }
    doSync()
  }, [user, isOnlineMode, streakUpdated])

  // Reset streakUpdated flag when user logs out
  useEffect(() => {
    if (!user) {
      setStreakUpdated(false)
    }
  }, [user])

  const friendlyTitle = useMemo(() => {
    switch (location.pathname) {
      case '/learn':
        return 'Missionen'
      case '/profile':
        return 'Profil'
      default:
        return 'Lernen'
    }
  }, [location.pathname])

  const triggerCelebration = useCallback((xp: number) => {
    // Trigger confetti
    setConfettiPieces(generateConfetti())
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)

    // Show toast
    setToast({ message: 'Mission abgeschlossen!', xp })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const handleCompleteMission = useCallback((rewardPoints = 60, completionBoost = 0.03) => {
    setProgress((prev) => {
      const nextCompletion = Math.min(1, prev.completion + completionBoost)
      const nextHearts = Math.min(5, prev.hearts + 1)
      return {
        ...prev,
        completion: nextCompletion,
        points: prev.points + rewardPoints,
        hearts: nextHearts,
      }
    })
    triggerCelebration(rewardPoints)
  }, [triggerCelebration])

  const handleWrongTry = () => {
    setProgress((prev) => ({
      ...prev,
      hearts: Math.max(0, prev.hearts - 1),
    }))
  }

  const handleAuthSuccess = () => {
    setShowLogin(false)
    // Reset streakUpdated to trigger sync after login
    setStreakUpdated(false)
  }

  const handleLogout = () => {
    setProgress(defaultProgress)
  }

  return (
    <div className="app-shell">
      <div className="ambient-blob blob-one" />
      <div className="ambient-blob blob-two" />
      <div className="app-frame">
        <aside className="sidebar">
          <Link to="/" className="brand">
            <span className="brand-mark">S</span>
            <div>
              <p className="brand-name">SaluLearn</p>
              <p className="eyebrow">Erste Hilfe</p>
            </div>
          </Link>
          <nav className="side-nav">
            <NavLink className="side-item" to="/">
              <span className="side-icon">🏠</span>
              Lernen
            </NavLink>
            <NavLink className="side-item" to="/learn">
              <span className="side-icon">🎯</span>
              Missionen
            </NavLink>
            <div className="side-item muted">
              <span className="side-icon">🏆</span>
              Rangliste
            </div>
            <div className="side-item muted">
              <span className="side-icon">🛒</span>
              Shop
            </div>
            <NavLink className="side-item" to="/profile">
              <span className="side-icon">👤</span>
              Profil
            </NavLink>
          </nav>
        </aside>

        <div className="main-area">
          <div className="stats-strip">
            <div className="stat-chip hearts">
              <span className="stat-icon">❤️</span>
              <span className="stat-value-text">{progress.hearts}</span>
            </div>
            <div className="stat-chip streak">
              <span className="stat-icon">🔥</span>
              <span className="stat-value-text">{progress.streak} Tage</span>
            </div>
            <div className="stat-chip xp">
              <span className="stat-icon">⭐</span>
              <span className="stat-value-text">{progress.points} XP</span>
            </div>
            <div className="stat-chip course">
              <span className="stat-icon">📚</span>
              <span className="stat-value-text">{Math.round(progress.completion * 100)}%</span>
            </div>
            {user ? (
              <Link to="/profile" className="stat-chip user-chip">
                <span className="user-avatar-mini">
                  {profile?.display_name?.slice(0, 1).toUpperCase() || user.email?.slice(0, 1).toUpperCase() || 'U'}
                </span>
                <span>{profile?.display_name || user.email?.split('@')[0] || 'User'}</span>
                {isSyncing && <span className="sync-indicator">↻</span>}
              </Link>
            ) : (
              <button className="cta secondary small" onClick={() => setShowLogin(true)}>
                Einloggen
              </button>
            )}
            <Link className="cta primary small" to="/learn">
              Start
            </Link>
          </div>

          <div className="page-heading">
            <p className="eyebrow">Stufe 1, Abschnitt 1</p>
            <h1>{friendlyTitle}</h1>
          </div>

          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  progress={progress}
                  onStartMission={() => handleCompleteMission(80, 0.05)}
                  onWrongTry={handleWrongTry}
                />
              }
            />
            <Route
              path="/learn"
              element={
                <LearnPage
                  progress={progress}
                  onCompleteMission={handleCompleteMission}
                  onWrongTry={handleWrongTry}
                />
              }
            />
            <Route
              path="/profile"
              element={
                <ProfilePage
                  progress={progress}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="/lesson/:lessonId"
              element={
                <LessonPage
                  onCompleteMission={handleCompleteMission}
                  onWrongTry={handleWrongTry}
                />
              }
            />
          </Routes>
        </div>

        <aside className="right-rail">
          <div className="card rail-card">
            <StreakCalendar lastActive={progress.lastActive} streak={progress.streak} />
          </div>
          <div className="card rail-card">
            <div className="rail-header">
              <div className="league-badge silver">
                <span className="league-icon">🥈</span>
                <span>Silber-Liga</span>
              </div>
              <button className="cta tiny ghost">Liga</button>
            </div>
            <p className="mission-meta" style={{ marginTop: '8px' }}>🏅 Du bist auf Platz 12</p>
            <p className="mission-meta">📈 5 Plaetze bis zum Abstieg</p>
          </div>
          <div className="card rail-card">
            <div className="rail-header">
              <p className="mission-title">Tagesmissionen</p>
              <button className="cta tiny ghost">Alle</button>
            </div>
            <ul className="rail-list">
              {dailyMissions.map((mission) => {
                const pct = Math.min(100, (mission.current / mission.total) * 100)
                return (
                  <li key={mission.id} className="rail-item">
                    <div className="rail-icon">{mission.icon}</div>
                    <div className="rail-copy">
                      <p className="mission-title">{mission.label}</p>
                      <div className="rail-progress">
                        <div className="rail-progress-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="mission-meta">
                        {mission.current} / {mission.total}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        </aside>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="confetti-container">
          {confettiPieces.map((piece) => (
            <div
              key={piece.id}
              className="confetti"
              style={{
                left: `${piece.left}%`,
                backgroundColor: piece.color,
                width: piece.size,
                height: piece.size,
                animationDelay: `${piece.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Success Toast */}
      {toast && (
        <div className="toast">
          <span className="toast-icon">🎉</span>
          <span>{toast.message}</span>
          <span className="xp-reward">+{toast.xp} XP</span>
        </div>
      )}
    </div>
  )
}

// Main App component wrapped with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App



