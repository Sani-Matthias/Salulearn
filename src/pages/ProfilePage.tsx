import { useState, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ACHIEVEMENTS } from '../lib/supabase'
import type { ProgressState } from '../services/progressService'
import { calculateLevel, getLeague, MAX_HEARTS } from '../services/progressService'
import { supabase } from '../lib/supabase'

type Props = {
  progress: ProgressState
  onShowAuth: () => void
  onLogout: () => void
}

export default function ProfilePage({ progress, onShowAuth, onLogout }: Props) {
  const { user, profile, signOut, updateProfile, isOnlineMode } = useAuth()
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState(profile?.display_name || '')
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const level = calculateLevel(progress.points)
  const league = getLeague(progress.points)
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Gast'
  const avatarUrl = profile?.avatar_url || null
  const avatarLetter = displayName[0].toUpperCase()
  const completedCount = progress.completedLessons.length

  const earnedBadges = new Set(progress.badges)

  const handleSaveName = async () => {
    if (!newName.trim()) return
    setSaving(true)
    await updateProfile({ display_name: newName.trim() })
    setEditingName(false)
    setSaving(false)
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !supabase || !user) return
    const file = e.target.files[0]
    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`
    const { error: uploadErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
    if (!uploadErr) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      await updateProfile({ avatar_url: data.publicUrl + '?t=' + Date.now() })
    }
  }

  const handleLogout = async () => {
    await signOut()
    onLogout()
  }

  return (
    <div className="profile-page">
      {/* Hero */}
      <div className="profile-hero">
        <div className="profile-avatar-wrap">
          <div className="profile-avatar-circle">
            {avatarUrl
              ? <img src={avatarUrl} alt={displayName} />
              : avatarLetter}
          </div>
          {user && isOnlineMode && (
            <>
              <button
                className="profile-avatar-edit"
                onClick={() => fileRef.current?.click()}
                aria-label="Avatar ändern"
              >✏️</button>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
            </>
          )}
        </div>

        {editingName ? (
          <div className="inline-edit" style={{ justifyContent: 'center', marginBottom: 8 }}>
            <input
              className="inline-input"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              autoFocus
              style={{ maxWidth: 200, textAlign: 'center' }}
            />
            <button className="inline-btn save" onClick={handleSaveName} disabled={saving}>✓</button>
            <button className="inline-btn cancel" onClick={() => setEditingName(false)}>✕</button>
          </div>
        ) : (
          <div
            className="profile-username"
            onClick={() => user && setEditingName(true)}
            style={{ cursor: user ? 'pointer' : 'default' }}
          >
            {displayName} {user && <span style={{ fontSize: 16 }}>✏️</span>}
          </div>
        )}

        {user && <div className="profile-useremail">{user.email}</div>}

        <div className="profile-league-badge">
          <span>{league.emoji}</span>
          <span>{league.name}-Liga</span>
        </div>
      </div>

      {/* Content */}
      <div className="profile-content">
        {/* Stats */}
        <div className="section-hdr">Statistiken</div>
        <div className="stats-cards">
          <div className="stat-card">
            <div className="stat-card-icon">⭐</div>
            <div>
              <div className="stat-card-val">{progress.points}</div>
              <div className="stat-card-lbl">XP gesamt</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">🔥</div>
            <div>
              <div className="stat-card-val">{progress.streak}</div>
              <div className="stat-card-lbl">Tage-Streak</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">❤️</div>
            <div>
              <div className="stat-card-val">{progress.hearts}/{MAX_HEARTS}</div>
              <div className="stat-card-lbl">Herzen</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">🎓</div>
            <div>
              <div className="stat-card-val">Lv. {level}</div>
              <div className="stat-card-lbl">Level</div>
            </div>
          </div>
          <div className="stat-card" style={{ gridColumn: '1 / -1' }}>
            <div className="stat-card-icon">📚</div>
            <div>
              <div className="stat-card-val">{completedCount} / 30</div>
              <div className="stat-card-lbl">Lektionen abgeschlossen</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ height: 10, background: 'var(--border)', borderRadius: 5, overflow: 'hidden', marginLeft: 8 }}>
                <div style={{ height: '100%', width: `${(completedCount / 30) * 100}%`, background: 'var(--success)', borderRadius: 5, transition: 'width 0.6s ease' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="section-hdr">Abzeichen</div>
        <div className="achievements-grid">
          {Object.values(ACHIEVEMENTS).map(ach => {
            const earned = earnedBadges.has(ach.id)
            return (
              <div key={ach.id} className={`ach-card${earned ? ' earned' : ' locked'}`}>
                <div className="ach-emoji">{ach.icon}</div>
                <div>
                  <div className="ach-name">{ach.name}</div>
                  <div className="ach-desc">{ach.description}</div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Menu */}
        <div className="section-hdr">Einstellungen</div>
        <div className="menu-list">
          {!user ? (
            <button className="menu-item" onClick={onShowAuth}>
              <span className="menu-icon">🔑</span>
              <span className="menu-text">Einloggen / Registrieren</span>
              <span className="menu-arrow">›</span>
            </button>
          ) : (
            <>
              <button className="menu-item" onClick={() => setEditingName(true)}>
                <span className="menu-icon">✏️</span>
                <span className="menu-text">Name ändern</span>
                <span className="menu-arrow">›</span>
              </button>
              <button className="menu-item danger" onClick={handleLogout}>
                <span className="menu-icon">🚪</span>
                <span className="menu-text">Ausloggen</span>
                <span className="menu-arrow">›</span>
              </button>
            </>
          )}
        </div>

        {!user && (
          <div style={{ textAlign: 'center', padding: '12px 0', fontSize: 14, fontWeight: 600, color: 'var(--text-muted)' }}>
            Erstelle ein Konto um deinen Fortschritt zu speichern!
          </div>
        )}
      </div>
    </div>
  )
}
