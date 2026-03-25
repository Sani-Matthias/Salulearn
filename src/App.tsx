import { useState, useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, NavLink, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import type { ProgressState } from './services/progressService';
import {
  calculateStreak,
  loadLocalProgress,
  saveLocalProgress,
  syncProgress,
  saveCloudProgress,
} from './services/progressService';
import HomePage from './pages/HomePage';
import LearnPage from './pages/LearnPage';
import ProfilePage from './pages/ProfilePage';
import LessonPage from './pages/LessonPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import StreakCalendar from './components/StreakCalendar';

// Get today's date in local timezone (YYYY-MM-DD)
const getLocalToday = () => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

const defaultProgress: ProgressState = {
  completion: 0,
  points: 0,
  streak: 0,
  badges: [],
  hearts: 5,
  coins: 0,
  lastActive: null,
  completedLessons: [],
  claimedMissions: [],
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
  const [isSyncing, setIsSyncing] = useState(false)
  const [streakUpdated, setStreakUpdated] = useState(false)
  const location = useLocation()

  // Load progress on mount and update streak for offline mode
  useEffect(() => {
    const localProgress = loadLocalProgress()
    if (localProgress) {
      // Calculate and update streak based on last active date
      const { streak: newStreak, isNewDay } = calculateStreak(
        localProgress.lastActive,
        localProgress.streak
      )

      const updatedProgress: ProgressState = {
        ...localProgress,
        streak: newStreak,
        lastActive: isNewDay ? getLocalToday() : localProgress.lastActive,
      }

      setProgress(updatedProgress)

      // Save updated progress if it's a new day
      if (isNewDay) {
        saveLocalProgress(updatedProgress)
      }
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
            lastActive: isNewDay ? getLocalToday() : syncedProgress.lastActive,
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
            <img src="/logo.png" alt="SaluLearn" className="brand-logo" />
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
            <div className="stat-chip pflaster">
              <span className="stat-icon">🩹</span>
              <span className="stat-value-text">{progress.coins}</span>
            </div>
            <div className="stat-chip course">
              <span className="stat-icon">📚</span>
              <span className="stat-value-text">{Math.round(progress.completion * 100)}%</span>
            </div>
            {user ? (
              <Link to="/profile" className="stat-chip user-chip">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="user-avatar-mini-img" />
                ) : (
                  <span className="user-avatar-mini">
                    {profile?.display_name?.slice(0, 1).toUpperCase() || user.email?.slice(0, 1).toUpperCase() || 'U'}
                  </span>
                )}
                <span>{profile?.display_name || user.email?.split('@')[0] || 'User'}</span>
                {isSyncing && <span className="sync-indicator">↻</span>}
              </Link>
            ) : (
              <Link className="cta secondary small" to="/login">
                Einloggen
              </Link>
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
            <Route element={<ProtectedRoute />}>
              <Route
                path="/"
                element={
                  <HomePage
                    progress={progress}
                  />
                }
              />
              <Route
                path="/learn"
                element={
                  <LearnPage
                    progress={progress}
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
                  <LessonPage />
                }
              />
            </Route>
            <Route path="/login" element={<LoginPage />} />
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

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav">
        <NavLink className="mobile-nav-item" to="/">
          <span className="mobile-nav-icon">🏠</span>
          <span>Lernen</span>
        </NavLink>
        <NavLink className="mobile-nav-item" to="/learn">
          <span className="mobile-nav-icon">🎯</span>
          <span>Missionen</span>
        </NavLink>
        <NavLink className="mobile-nav-item" to="/profile">
          <span className="mobile-nav-icon">👤</span>
          <span>Profil</span>
        </NavLink>
      </nav>
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

