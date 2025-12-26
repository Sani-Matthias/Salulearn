import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ACHIEVEMENTS } from '../lib/supabase'
import {
  getUserAchievements,
  calculateLevel,
  getLeague,
  type ProgressState,
} from '../services/progressService'
import { uploadAvatar, deleteAvatar } from '../services/avatarService'

type ProfilePageProps = {
  progress: ProgressState
  onLogout: () => void
}

export default function ProfilePage({ progress, onLogout }: ProfilePageProps) {
  const { user, profile, updateProfile, updatePassword, signOut, isOnlineMode, refreshProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [displayName, setDisplayName] = useState(profile?.display_name || '')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [showPasswordChange, setShowPasswordChange] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [achievements, setAchievements] = useState<string[]>([])
  const [avatarUploading, setAvatarUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const levelInfo = calculateLevel(progress.points)
  const league = getLeague(progress.points)

  // Load achievements
  useEffect(() => {
    if (user && isOnlineMode) {
      getUserAchievements(user.id).then(setAchievements)
    }
  }, [user, isOnlineMode])

  const handleSaveProfile = async () => {
    if (!displayName.trim()) {
      setError('Name darf nicht leer sein.')
      return
    }

    setLoading(true)
    setError(null)

    const result = await updateProfile({ display_name: displayName.trim() })
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess('Profil aktualisiert!')
      setIsEditing(false)
      setTimeout(() => setSuccess(null), 3000)
    }

    setLoading(false)
  }

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen haben.')
      return
    }
    if (newPassword !== confirmNewPassword) {
      setError('Passwoerter stimmen nicht ueberein.')
      return
    }

    setLoading(true)
    setError(null)

    const result = await updatePassword(newPassword)
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess('Passwort geaendert!')
      setNewPassword('')
      setConfirmNewPassword('')
      setShowPasswordChange(false)
      setTimeout(() => setSuccess(null), 3000)
    }

    setLoading(false)
  }

  const handleLogout = async () => {
    await signOut()
    onLogout()
  }

  // Avatar initials
  const getInitials = () => {
    const name = profile?.display_name || user?.email || 'U'
    return name.slice(0, 2).toUpperCase()
  }

  // Handle avatar upload
  const handleAvatarClick = () => {
    if (isOnlineMode && !avatarUploading) {
      fileInputRef.current?.click()
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    console.log('Starting avatar change, file:', file.name, file.size, file.type)
    setAvatarUploading(true)
    setError(null)

    try {
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Upload Timeout - bitte versuche es erneut')), 30000)
      )

      const result = await Promise.race([
        uploadAvatar(user.id, file),
        timeoutPromise
      ])

      if (result.error) {
        console.error('Upload result error:', result.error)
        setError(result.error)
      } else {
        console.log('Upload successful, refreshing profile')
        setSuccess('Avatar aktualisiert!')
        await refreshProfile()
        setTimeout(() => setSuccess(null), 3000)
      }
    } catch (err) {
      console.error('Avatar upload error:', err)
      setError(err instanceof Error ? err.message : 'Fehler beim Hochladen')
    } finally {
      setAvatarUploading(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteAvatar = async () => {
    if (!user || !profile?.avatar_url) return

    setAvatarUploading(true)
    setError(null)

    const result = await deleteAvatar(user.id, profile.avatar_url)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess('Avatar entfernt!')
      await refreshProfile()
      setTimeout(() => setSuccess(null), 3000)
    }

    setAvatarUploading(false)
  }

  const allAchievements = Object.values(ACHIEVEMENTS)

  return (
    <div className="profile-layout">
      <div className="profile-main">
        {/* Profile Header Card */}
        <section className="card profile-header-card">
          <div className="profile-header">
            <div className="profile-avatar-section">
              <div
                className={`profile-avatar large ${isOnlineMode ? 'clickable' : ''} ${avatarUploading ? 'uploading' : ''}`}
                onClick={handleAvatarClick}
                title={isOnlineMode ? 'Klicke um Avatar zu aendern' : ''}
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" />
                ) : (
                  <span>{getInitials()}</span>
                )}
                {isOnlineMode && (
                  <div className="avatar-overlay">
                    {avatarUploading ? (
                      <span className="avatar-spinner" />
                    ) : (
                      <span className="avatar-edit-icon">📷</span>
                    )}
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
              {isOnlineMode && profile?.avatar_url && (
                <button
                  className="cta tiny ghost avatar-delete-btn"
                  onClick={handleDeleteAvatar}
                  disabled={avatarUploading}
                >
                  Avatar entfernen
                </button>
              )}
              <div className={`league-badge ${league.color}`}>
                <span className="league-icon">{league.icon}</span>
                <span>{league.name}</span>
              </div>
            </div>

            <div className="profile-info">
              {isEditing ? (
                <div className="profile-edit-form">
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="profile-name-input"
                    placeholder="Dein Name"
                  />
                  <div className="profile-edit-actions">
                    <button
                      className="cta small primary"
                      onClick={handleSaveProfile}
                      disabled={loading}
                    >
                      Speichern
                    </button>
                    <button
                      className="cta small ghost"
                      onClick={() => {
                        setIsEditing(false)
                        setDisplayName(profile?.display_name || '')
                      }}
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="profile-name">
                    {profile?.display_name || user?.email?.split('@')[0] || 'User'}
                  </h2>
                  <p className="profile-email">{user?.email || 'Offline-Modus'}</p>
                  {isOnlineMode && (
                    <button
                      className="cta tiny ghost"
                      onClick={() => setIsEditing(true)}
                    >
                      Bearbeiten
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {error && (
            <div className="auth-error" style={{ marginTop: '12px' }}>
              <span>❌</span>
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="auth-success" style={{ marginTop: '12px' }}>
              <span>✅</span>
              <span>{success}</span>
            </div>
          )}
        </section>

        {/* Stats Card */}
        <section className="card profile-stats-card">
          <h3>Deine Statistiken</h3>
          <div className="profile-stats-grid">
            <div className="profile-stat-item">
              <div className="profile-stat-icon xp">⭐</div>
              <div className="profile-stat-info">
                <span className="profile-stat-value">{progress.points}</span>
                <span className="profile-stat-label">XP gesamt</span>
              </div>
            </div>

            <div className="profile-stat-item">
              <div className="profile-stat-icon streak">🔥</div>
              <div className="profile-stat-info">
                <span className="profile-stat-value">{progress.streak}</span>
                <span className="profile-stat-label">Tage Streak</span>
              </div>
            </div>

            <div className="profile-stat-item">
              <div className="profile-stat-icon hearts">❤️</div>
              <div className="profile-stat-info">
                <span className="profile-stat-value">{progress.hearts}/5</span>
                <span className="profile-stat-label">Herzen</span>
              </div>
            </div>

            <div className="profile-stat-item">
              <div className="profile-stat-icon level">🏅</div>
              <div className="profile-stat-info">
                <span className="profile-stat-value">Level {levelInfo.level}</span>
                <span className="profile-stat-label">
                  {levelInfo.currentXp}/{levelInfo.nextLevelXp} XP
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Achievements Card */}
        <section className="card profile-achievements-card">
          <h3>Erfolge</h3>
          <div className="achievements-grid">
            {allAchievements.map((achievement) => {
              const isUnlocked = achievements.includes(achievement.id)
              return (
                <div
                  key={achievement.id}
                  className={`achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`}
                >
                  <div className="achievement-icon">{achievement.icon}</div>
                  <div className="achievement-info">
                    <span className="achievement-name">{achievement.name}</span>
                    <span className="achievement-desc">{achievement.description}</span>
                  </div>
                  {isUnlocked && <span className="achievement-check">✓</span>}
                </div>
              )
            })}
          </div>
        </section>

        {/* Account Settings Card */}
        <section className="card profile-settings-card">
          <h3>Kontoeinstellungen</h3>

          {isOnlineMode && (
            <>
              {!showPasswordChange ? (
                <button
                  className="cta ghost profile-settings-btn"
                  onClick={() => setShowPasswordChange(true)}
                >
                  🔒 Passwort aendern
                </button>
              ) : (
                <div className="password-change-form">
                  <label className="field">
                    <span>Neues Passwort</span>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </label>
                  <label className="field">
                    <span>Bestaetigen</span>
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      minLength={6}
                    />
                  </label>
                  <div className="password-change-actions">
                    <button
                      className="cta small primary"
                      onClick={handlePasswordChange}
                      disabled={loading}
                    >
                      Speichern
                    </button>
                    <button
                      className="cta small ghost"
                      onClick={() => {
                        setShowPasswordChange(false)
                        setNewPassword('')
                        setConfirmNewPassword('')
                      }}
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          <button className="cta ghost profile-settings-btn logout-btn" onClick={handleLogout}>
            🚪 Abmelden
          </button>

          {!isOnlineMode && (
            <p className="offline-notice">
              Du bist im Offline-Modus. Melde dich an, um deine Daten zu synchronisieren.
            </p>
          )}
        </section>
      </div>
    </div>
  )
}
