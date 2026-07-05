import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ACHIEVEMENTS } from '../lib/supabase'
import type { ProgressState } from '../services/progressService'
import { calculateLevel, getLeague, MAX_HEARTS } from '../services/progressService'
import { supabase } from '../lib/supabase'
import AvatarFrame from '../components/AvatarFrame'

type Props = {
  progress: ProgressState
  isPro: boolean
  onShowAuth: () => void
  onLogout: () => void
}

export default function ProfilePage({ progress, isPro, onShowAuth, onLogout }: Props) {
  const { user, profile, signOut, updateProfile, isOnlineMode } = useAuth()
  const navigate = useNavigate()
  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState(profile?.display_name || '')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 4000)
  }

  const level = calculateLevel(progress.points)
  const league = getLeague(progress.points)
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'Gast'
  const avatarUrl = profile?.avatar_url || null
  const avatarLetter = displayName[0].toUpperCase()
  const completedCount = progress.completedLessons.length

  const earnedBadges = new Set(progress.badges)

  const startEditingName = () => {
    setNewName(profile?.display_name || '')
    setEditingName(true)
  }

  const handleSaveName = async () => {
    if (!newName.trim()) return
    setSaving(true)
    try {
      const { error } = await updateProfile({ display_name: newName.trim() })
      if (error) {
        showToast(`Fehler: ${error}`, false)
      } else {
        setEditingName(false)
        showToast('Name erfolgreich geändert!', true)
      }
    } catch (err) {
      showToast(`Fehler: ${err instanceof Error ? err.message : 'Netzwerkfehler'}`, false)
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !supabase || !user) return
    const file = e.target.files[0]

    if (file.size > 3 * 1024 * 1024) {
      showToast('Bild zu groß – maximal 3 MB erlaubt.', false)
      return
    }
    if (!file.type.startsWith('image/')) {
      showToast('Nur Bilddateien erlaubt (JPG, PNG, etc.)', false)
      return
    }

    setUploading(true)
    try {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${user.id}/avatar.${ext}`

      const { error: uploadErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true })

      if (uploadErr) {
        showToast(`Upload fehlgeschlagen: ${uploadErr.message}`, false)
        return
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const { error: profileErr } = await updateProfile({
        avatar_url: data.publicUrl + '?t=' + Date.now(),
      })

      if (profileErr) {
        showToast(`Profilbild konnte nicht gespeichert werden: ${profileErr}`, false)
      } else {
        showToast('Profilbild erfolgreich aktualisiert!', true)
      }
    } catch (err) {
      showToast(`Upload fehlgeschlagen: ${err instanceof Error ? err.message : 'Netzwerkfehler'}`, false)
    } finally {
      setUploading(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    onLogout()
  }

  return (
    <div className="profile-page">
      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: 72, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, background: toast.ok ? '#58CC02' : '#FF4B4B',
          color: '#fff', borderRadius: 16, padding: '12px 20px',
          fontSize: 14, fontWeight: 700, boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          maxWidth: 'calc(100% - 48px)', textAlign: 'center',
          animation: 'slide-up 0.3s ease',
        }}>
          {toast.ok ? '✅ ' : '❌ '}{toast.msg}
        </div>
      )}

      {/* Hero */}
      <div className="profile-hero">
        <div className="profile-avatar-wrap">
          <AvatarFrame frameId={progress.equippedFrame} size="lg">
            <div className="profile-avatar-circle">
              {avatarUrl
                ? <img src={avatarUrl} alt={displayName} />
                : avatarLetter}
            </div>
          </AvatarFrame>
          {user && isOnlineMode && (
            <>
              <button
                className="profile-avatar-edit"
                onClick={() => !uploading && fileRef.current?.click()}
                aria-label="Avatar ändern"
                style={{ opacity: uploading ? 0.6 : 1 }}
              >{uploading ? '⏳' : '✏️'}</button>
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
            onClick={() => user && startEditingName()}
            style={{ cursor: user ? 'pointer' : 'default' }}
          >
            {displayName} {user && <span style={{ fontSize: 16 }}>✏️</span>}
          </div>
        )}

        {user && <div className="profile-useremail">{user.email}</div>}

        <div className="profile-badges-row">
          <div className="profile-league-badge">
            <span>{league.emoji}</span>
            <span>{league.name}-Liga</span>
          </div>
          {isPro && (
            <div className="pro-badge">
              <span>⭐</span>
              <span>Pro</span>
            </div>
          )}
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
              <button className="menu-item" onClick={startEditingName}>
                <span className="menu-icon">✏️</span>
                <span className="menu-text">Name ändern</span>
                <span className="menu-arrow">›</span>
              </button>
              <button className="menu-item" onClick={() => navigate('/shop')}>
                <span className="menu-icon">⭐</span>
                <span className="menu-text">{isPro ? 'Pro verwalten' : 'SaluLearn Pro'}</span>
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
