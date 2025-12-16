import { useEffect, useMemo, useState, useCallback } from 'react'
import { Link, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LearnPage from './pages/LearnPage'
import ProfilePage from './pages/ProfilePage'
import StreakCalendar from './components/StreakCalendar'
import AuthModal from './components/AuthModal'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { syncProgress, loadLocalProgress, saveLocalProgress, type ProgressState } from './services/progressService'

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
  completion: 0.24,
  points: 850,
  streak: 3,
  badges: ['Ersthelfer', 'Teamplayer'],
  hearts: 5,
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
  const [lastActive, setLastActive] = useState<string | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
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

  // Sync progress with cloud when user logs in
  useEffect(() => {
    const doSync = async () => {
      if (user && isOnlineMode && !isSyncing) {
        setIsSyncing(true)
        try {
          const syncedProgress = await syncProgress(user.id, progress, lastActive || today)
          setProgress(syncedProgress)
        } catch (error) {
          console.error('Sync error:', error)
        }
        setIsSyncing(false)
      }
    }
    doSync()
  }, [user, isOnlineMode])

  // Handle streak logic
  useEffect(() => {
    if (user && lastActive !== today) {
      const lastDate = lastActive ? new Date(lastActive) : new Date()
      const todayDate = new Date(today)
      const diffTime = Math.abs(todayDate.getTime() - lastDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays === 1) {
        setProgress((prev) => ({
          ...prev,
          streak: Math.min(99, prev.streak + 1),
        }))
      } else if (diffDays > 1) {
        setProgress((prev) => ({
          ...prev,
          streak: 1,
        }))
      }

      setLastActive(today)
    }
  }, [user, lastActive])

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
    // Trigger sync after login
    if (user && isOnlineMode) {
      syncProgress(user.id, progress, today)
    }
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
          </Routes>
        </div>

        <aside className="right-rail">
          <div className="card rail-card">
            <StreakCalendar lastActive={lastActive} streak={progress.streak} />
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



