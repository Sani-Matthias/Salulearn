import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

type Mode = 'login' | 'register' | 'reset'

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const { signIn, signUp, resetPassword, signInWithGoogle } = useAuth()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const reset = () => { setError(null); setSuccess(null) }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    reset()
    setLoading(true)
    if (mode === 'login') {
      const { error } = await signIn(email, password)
      if (error) setError(error)
      else onClose()
    } else if (mode === 'register') {
      if (!name.trim()) { setError('Bitte gib deinen Namen ein.'); setLoading(false); return }
      const { error } = await signUp(email, password, name)
      if (error) setError(error)
      else setSuccess('Bestätigungs-E-Mail gesendet! Bitte prüfe dein Postfach.')
    } else {
      const { error } = await resetPassword(email)
      if (error) setError(error)
      else setSuccess('Reset-Link wurde gesendet!')
    }
    setLoading(false)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle" />

        <div className="modal-title">
          {mode === 'login' ? 'Willkommen zurück! 👋' : mode === 'register' ? 'Konto erstellen 🎉' : 'Passwort zurücksetzen 🔑'}
        </div>
        <div className="modal-subtitle">
          {mode === 'login' ? 'Melde dich an und lerne weiter' : mode === 'register' ? 'Starte deine Erste-Hilfe-Reise' : 'Wir schicken dir einen Reset-Link'}
        </div>

        {error && <div className="form-alert error">⚠️ {error}</div>}
        {success && <div className="form-alert success">✅ {success}</div>}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-field">
              <label className="form-label">Name</label>
              <input className="form-input" type="text" placeholder="Dein Name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
          )}
          <div className="form-field">
            <label className="form-label">E-Mail</label>
            <input className="form-input" type="email" placeholder="deine@email.de" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          {mode !== 'reset' && (
            <div className="form-field">
              <label className="form-label">Passwort</label>
              <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            </div>
          )}

          <div className="modal-actions">
            <button type="submit" className="main-btn red" disabled={loading}>
              {loading ? '...' : mode === 'login' ? 'Einloggen' : mode === 'register' ? 'Konto erstellen' : 'Link senden'}
            </button>
            {mode === 'login' && (
              <>
                <div className="divider">oder</div>
                <button type="button" className="google-btn" onClick={async () => { setLoading(true); await signInWithGoogle(); setLoading(false) }} disabled={loading}>
                  <span style={{ fontSize: 20 }}>🌐</span> Mit Google fortfahren
                </button>
              </>
            )}
          </div>
        </form>

        <div style={{ height: 8 }} />

        {mode === 'login' && (
          <>
            <div className="modal-switch">
              Noch kein Konto?{' '}
              <button className="modal-switch-btn" onClick={() => { setMode('register'); reset() }}>Registrieren</button>
            </div>
            <div className="modal-switch" style={{ marginTop: 6 }}>
              <button className="modal-switch-btn" onClick={() => { setMode('reset'); reset() }}>Passwort vergessen?</button>
            </div>
          </>
        )}
        {mode !== 'login' && (
          <div className="modal-switch">
            <button className="modal-switch-btn" onClick={() => { setMode('login'); reset() }}>← Zurück zum Login</button>
          </div>
        )}
      </div>
    </div>
  )
}
