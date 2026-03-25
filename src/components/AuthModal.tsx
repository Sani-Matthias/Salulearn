import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

type AuthModalProps = {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

type AuthMode = 'login' | 'register' | 'forgot'

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { signIn, signUp, signInWithGoogle, resetPassword, isOnlineMode, resendConfirmationEmail } = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showResendForEmail, setShowResendForEmail] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    setShowResendForEmail(null)

    try {
      if (mode === 'login') {
        const result = await signIn(email, password)
        if (result.error) {
          setError(result.error)
          if (result.error.includes('E-Mail noch nicht bestaetigt')) {
            setShowResendForEmail(email)
          }
        } else {
          onSuccess?.()
          onClose()
        }
      } else if (mode === 'register') {
        if (password !== confirmPassword) {
          setError('Passwoerter stimmen nicht ueberein.')
          setLoading(false)
          return
        }
        if (password.length < 6) {
          setError('Passwort muss mindestens 6 Zeichen haben.')
          setLoading(false)
          return
        }
        if (!displayName.trim()) {
          setError('Bitte gib einen Namen ein.')
          setLoading(false)
          return
        }

        const result = await signUp(email, password, displayName.trim())
        if (result.error) {
          setError(result.error)
        } else {
          setSuccess('Konto erstellt! Bitte bestaetige deine E-Mail-Adresse. Schau in dein Postfach (und im Spam-Ordner).')
          setShowResendForEmail(email)
          setPassword('')
          setConfirmPassword('')
        }
      } else if (mode === 'forgot') {
        const result = await resetPassword(email)
        if (result.error) {
          setError(result.error)
        } else {
          setSuccess('E-Mail zum Zuruecksetzen wurde gesendet. Pruefe dein Postfach.')
        }
      }
    } catch (err) {
      setError('Ein Fehler ist aufgetreten. Bitte versuche es erneut.')
    }

    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    setError(null)
    setLoading(true)
    const result = await signInWithGoogle()
    if (result.error) {
      setError(result.error)
    }
    setLoading(false)
  }

  const handleResend = async () => {
    if (!showResendForEmail) return

    setError(null)
    setSuccess(null)
    setLoading(true)

    const result = await resendConfirmationEmail(showResendForEmail)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess('Bestaetigungs-E-Mail wurde erneut gesendet.')
    }

    setLoading(false)
  }

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode)
    setError(null)
    setSuccess(null)
    setShowResendForEmail(null)
  }

  const getPasswordStrength = (pwd: string): { strength: number; label: string; color: string } => {
    let strength = 0
    if (pwd.length >= 6) strength++
    if (pwd.length >= 8) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^A-Za-z0-9]/.test(pwd)) strength++

    if (strength <= 1) return { strength: 1, label: 'Schwach', color: '#ef4444' }
    if (strength <= 2) return { strength: 2, label: 'Mittel', color: '#f97316' }
    if (strength <= 3) return { strength: 3, label: 'Gut', color: '#f7b500' }
    return { strength: 4, label: 'Stark', color: '#22c55e' }
  }

  const passwordStrength = mode === 'register' ? getPasswordStrength(password) : null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>
            {mode === 'login' && 'Anmelden'}
            {mode === 'register' && 'Registrieren'}
            {mode === 'forgot' && 'Passwort vergessen'}
          </h3>
          <button className="cta tiny ghost" onClick={onClose}>
            ✕
          </button>
        </div>

        {!isOnlineMode && (
          <div className="auth-warning">
            <span>⚠️</span>
            <span>Offline-Modus: Keine Cloud-Synchronisation verfuegbar.</span>
          </div>
        )}

        {error && (
          <div className="auth-error">
            <span>❌</span>
            <span>{error}</span>
            {showResendForEmail && (
              <button onClick={handleResend} className="text-link" disabled={loading}>
                {loading ? 'Senden...' : 'Bestaetigungs-E-Mail erneut senden'}
              </button>
            )}
          </div>
        )}

        {success && (
          <div className="auth-success">
            <span>✅</span>
            <span>{success}</span>
            {showResendForEmail && mode === 'register' && (
              <button onClick={handleResend} className="text-link" disabled={loading}>
                {loading ? 'Senden...' : 'Nicht erhalten? Erneut senden.'}
              </button>
            )}
          </div>
        )}

        <form className="modal-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <label className="field">
              <span>Name</span>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Dein Anzeigename"
                required
                disabled={loading}
              />
            </label>
          )}

          <label className="field">
            <span>E-Mail</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="deine@email.de"
              required
              disabled={loading}
            />
          </label>

          {mode !== 'forgot' && (
            <label className="field">
              <span>Passwort</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                minLength={6}
              />
              {mode === 'register' && password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div
                      className="strength-fill"
                      style={{
                        width: `${(passwordStrength!.strength / 4) * 100}%`,
                        backgroundColor: passwordStrength!.color,
                      }}
                    />
                  </div>
                  <span style={{ color: passwordStrength!.color }}>
                    {passwordStrength!.label}
                  </span>
                </div>
              )}
            </label>
          )}

          {mode === 'register' && (
            <label className="field">
              <span>Passwort bestaetigen</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                minLength={6}
              />
            </label>
          )}

          <button className="cta primary" type="submit" disabled={loading}>
            {loading ? (
              <span className="loading-spinner" />
            ) : mode === 'login' ? (
              'Anmelden'
            ) : mode === 'register' ? (
              'Konto erstellen'
            ) : (
              'Link senden'
            )}
          </button>
        </form>

        {mode !== 'forgot' && isOnlineMode && (
          <>
            <div className="auth-divider">
              <span>oder</span>
            </div>

            <button
              className="cta ghost google-btn"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Mit Google anmelden
            </button>
          </>
        )}

        <div className="auth-footer">
          {mode === 'login' && (
            <>
              <button
                type="button"
                className="text-link"
                onClick={() => switchMode('forgot')}
              >
                Passwort vergessen?
              </button>
              <span className="auth-switch">
                Neu hier?{' '}
                <button
                  type="button"
                  className="text-link"
                  onClick={() => switchMode('register')}
                >
                  Registrieren
                </button>
              </span>
            </>
          )}
          {mode === 'register' && (
            <span className="auth-switch">
              Schon registriert?{' '}
              <button
                type="button"
                className="text-link"
                onClick={() => switchMode('login')}
              >
                Anmelden
              </button>
            </span>
          )}
          {mode === 'forgot' && (
            <button
              type="button"
              className="text-link"
              onClick={() => switchMode('login')}
            >
              Zurueck zur Anmeldung
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

