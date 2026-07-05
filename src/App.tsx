import { useState, useEffect } from 'react'
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import type { ProgressState } from './services/progressService'
import {
  getDefaultProgress,
  loadLocalProgress,
  saveLocalProgress,
  calculateStreak,
  saveCloudProgress,
  syncProgress,
  completeLesson,
  addTrainingXp,
  applyHeartRegen,
  secondsUntilNextHeart,
  purchaseItem,
  equipItem,
  MAX_HEARTS,
} from './services/progressService'
import { addLeagueXp } from './services/leagueService'
import type { ShopItem } from './data/shopCatalog'
import AvatarFrame from './components/AvatarFrame'
import HomePage from './pages/HomePage'
import LessonPage from './pages/LessonPage'
import TrainingPage from './pages/TrainingPage'
import ProfilePage from './pages/ProfilePage'
import LeaderboardPage from './pages/LeaderboardPage'
import ShopPage from './pages/ShopPage'
import BlogPage from './pages/BlogPage'
import AuthModal from './components/AuthModal'

const getLocalToday = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

type Tab = 'home' | 'training' | 'leaderboard' | 'shop' | 'profile'

function AppContent() {
  const { user, profile, isOnlineMode } = useAuth()
  const [progress, setProgress] = useState<ProgressState>(getDefaultProgress())
  const [showAuth, setShowAuth] = useState(false)
  const [synced, setSynced] = useState(false)
  const [heartCountdown, setHeartCountdown] = useState<number | null>(null)
  const location = useLocation()
  const navigate = useNavigate()

  const isLessonPage = location.pathname.startsWith('/lesson/') || location.pathname.startsWith('/training') || location.pathname.startsWith('/blog')

  const activeTab: Tab =
    location.pathname.startsWith('/leaderboard') ? 'leaderboard' :
    location.pathname.startsWith('/training')    ? 'training'    :
    location.pathname.startsWith('/shop')        ? 'shop'        :
    location.pathname.startsWith('/profile')     ? 'profile'     :
    'home'

  const isPro = !!profile?.is_pro && (!profile.pro_expires_at || new Date(profile.pro_expires_at) > new Date())

  // Load local progress on mount
  useEffect(() => {
    const local = loadLocalProgress()
    if (local) {
      const { streak, isNewDay } = calculateStreak(local.lastActive, local.streak)
      const withStreak = { ...local, streak, lastActive: isNewDay ? getLocalToday() : local.lastActive }
      const updated = applyHeartRegen(withStreak)
      setProgress(updated)
      if (isNewDay) saveLocalProgress(updated)
    }
  }, [])

  // Heart regeneration tick: +1 heart per hour, updates countdown display every second
  useEffect(() => {
    const id = setInterval(() => {
      setProgress(prev => applyHeartRegen(prev))
      setHeartCountdown(secs => (secs !== null && secs > 0 ? secs - 1 : secs))
    }, 1000)
    return () => clearInterval(id)
  }, [])

  // Recalculate countdown whenever hearts or regen timestamp changes
  useEffect(() => {
    setHeartCountdown(secondsUntilNextHeart(progress))
  }, [progress.hearts, progress.lastHeartRegenAt])

  // Sync with cloud on login
  useEffect(() => {
    if (!user || !isOnlineMode || synced) return
    const doSync = async () => {
      const merged = await syncProgress(user.id, progress)
      const { streak, isNewDay } = calculateStreak(merged.lastActive, merged.streak)
      const updated = { ...merged, streak, lastActive: isNewDay ? getLocalToday() : merged.lastActive }
      setProgress(updated)
      if (isNewDay) {
        await saveCloudProgress(user.id, updated)
        saveLocalProgress(updated)
      }
      setSynced(true)
    }
    doSync()
  }, [user, isOnlineMode, synced, progress])

  useEffect(() => {
    if (!user) setSynced(false)
  }, [user])

  // Apply equipped theme as a data attribute so CSS can override accent colors
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', progress.equippedTheme ?? '')
  }, [progress.equippedTheme])

  const handleCompleteLesson = (lessonId: string, xpReward: number, heartsLost: number) => {
    setProgress(prev => {
      const next = completeLesson(prev, lessonId, xpReward, heartsLost, isPro)
      if (user && isOnlineMode) {
        saveCloudProgress(user.id, next)
        addLeagueXp(user.id, xpReward)
      }
      return next
    })
  }

  const handleTrainingXp = (xp: number) => {
    setProgress(prev => {
      const next = addTrainingXp(prev, xp, isPro)
      if (user && isOnlineMode) {
        saveCloudProgress(user.id, next)
        addLeagueXp(user.id, xp)
      }
      return next
    })
  }

  const handlePurchase = (item: ShopItem) => {
    setProgress(prev => {
      const next = purchaseItem(prev, item)
      if (user && isOnlineMode) saveCloudProgress(user.id, next)
      return next
    })
  }

  const handleEquip = (type: 'frame' | 'theme', itemId: string | null) => {
    setProgress(prev => {
      const owned = itemId ? prev.inventory.includes(itemId) || (itemId === 'frame_pro' && isPro) : true
      const next = equipItem(prev, type, itemId, owned)
      if (user && isOnlineMode) saveCloudProgress(user.id, next)
      return next
    })
  }

  const navTo = (tab: Tab) => {
    if (tab === 'home') navigate('/')
    else if (tab === 'training') navigate('/training')
    else if (tab === 'leaderboard') navigate('/leaderboard')
    else if (tab === 'shop') navigate('/shop')
    else navigate('/profile')
  }

  const displayName = profile?.display_name || user?.email?.split('@')[0] || null
  const avatarUrl = profile?.avatar_url || null
  const avatarLetter = (displayName || 'U')[0].toUpperCase()

  return (
    <div className="app-root">
      {/* Top bar – hidden during lessons */}
      {!isLessonPage && (
        <div className="top-bar">
          <button
            className="blog-icon-btn"
            onClick={() => navigate('/blog')}
            aria-label="Blog"
            title="Salulearn Blog"
          >
            📰
          </button>
          <img src="/logo.png" alt="SaluLearn" className="logo-mark" />

          <div className="stat-pill streak">
            <span className={`stat-icon${progress.streak > 0 ? ' fire' : ''}`}>🔥</span>
            <span>{progress.streak}</span>
          </div>
          <div
            className="stat-pill hearts"
            title={!isPro && heartCountdown !== null ? `Nächstes Herz in ${Math.floor(heartCountdown / 60)}:${String(heartCountdown % 60).padStart(2, '0')}` : undefined}
          >
            <span className="stat-icon">❤️</span>
            {isPro ? (
              <span>∞</span>
            ) : (
              <>
                <span>{progress.hearts}{progress.hearts < MAX_HEARTS ? `/${MAX_HEARTS}` : ''}</span>
                {heartCountdown !== null && (
                  <span className="heart-regen-timer">
                    {Math.floor(heartCountdown / 60)}:{String(heartCountdown % 60).padStart(2, '0')}
                  </span>
                )}
              </>
            )}
          </div>
          <div className="stat-pill xp">
            <span className="stat-icon">⭐</span>
            <span>{progress.points}</span>
          </div>
          <div className="stat-pill coins">
            <span className="stat-icon">🪙</span>
            <span>{progress.coins}</span>
          </div>

          <div className="top-bar-spacer" />

          {user ? (
            <button
              className="top-bar-avatar-wrap"
              onClick={() => navigate('/profile')}
              aria-label="Profil"
            >
              <AvatarFrame frameId={progress.equippedFrame} size="sm">
                <div className="top-bar-avatar">
                  {avatarUrl
                    ? <img src={avatarUrl} alt={displayName || ''} />
                    : avatarLetter}
                </div>
              </AvatarFrame>
            </button>
          ) : (
            <button className="top-bar-login" onClick={() => setShowAuth(true)}>
              Einloggen
            </button>
          )}
        </div>
      )}

      {/* Page content */}
      <Routes>
        <Route path="/" element={<HomePage progress={progress} onStartLesson={id => navigate(`/lesson/${id}`)} />} />
        <Route path="/lesson/:lessonId" element={<LessonPage progress={progress} onComplete={handleCompleteLesson} onExit={() => navigate('/')} />} />
        <Route path="/training" element={<TrainingPage progress={progress} onXpEarned={handleTrainingXp} onExit={() => navigate('/')} />} />
        <Route path="/leaderboard" element={<LeaderboardPage progress={progress} />} />
        <Route path="/shop" element={<ShopPage progress={progress} isPro={isPro} onShowAuth={() => setShowAuth(true)} onPurchase={handlePurchase} onEquip={handleEquip} />} />
        <Route path="/profile" element={<ProfilePage progress={progress} isPro={isPro} onShowAuth={() => setShowAuth(true)} onLogout={() => setProgress(getDefaultProgress())} />} />
        <Route path="/blog" element={<BlogPage />} />
      </Routes>

      {/* Bottom nav – hidden during lessons */}
      {!isLessonPage && (
        <nav className="bottom-nav">
          <button className={`nav-btn${activeTab === 'home' ? ' active' : ''}`} onClick={() => navTo('home')}>
            <span className="nav-icon">🏠</span>
            <span className="nav-label">Lernen</span>
          </button>
          <button className={`nav-btn${activeTab === 'training' ? ' active' : ''}`} onClick={() => navTo('training')}>
            <span className="nav-icon">🎯</span>
            <span className="nav-label">Training</span>
          </button>
          <button className={`nav-btn${activeTab === 'leaderboard' ? ' active' : ''}`} onClick={() => navTo('leaderboard')}>
            <span className="nav-icon">🏆</span>
            <span className="nav-label">Rangliste</span>
          </button>
          <button className={`nav-btn${activeTab === 'shop' ? ' active' : ''}`} onClick={() => navTo('shop')}>
            <span className="nav-icon">🛒</span>
            <span className="nav-label">Shop</span>
          </button>
          <button className={`nav-btn${activeTab === 'profile' ? ' active' : ''}`} onClick={() => navTo('profile')}>
            <span className="nav-icon">👤</span>
            <span className="nav-label">Profil</span>
          </button>
        </nav>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
