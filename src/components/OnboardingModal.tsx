import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import type { ExperienceLevel } from '../lib/supabase'

type Props = {
  // 'register': no account yet — collects username/email/password, then experience + path, then calls signUp.
  // 'complete': already logged in (e.g. via Google) but missing onboarding data — asks experience + path only.
  mode: 'register' | 'complete'
  onClose?: () => void
  onDone: () => void
}

type RegisterStep = 'account' | 'experience' | 'path'
type CompleteStep = 'experience' | 'path'

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string; desc: string; emoji: string }[] = [
  { value: 'none', label: 'Keine Erfahrung', desc: 'Ich fange bei Null an', emoji: '🌱' },
  { value: 'normal', label: 'Normal', desc: 'Ich kenne die Grundlagen', emoji: '🙂' },
  { value: 'pro', label: 'Erste-Hilfe-Profi', desc: 'Ich habe bereits Erfahrung', emoji: '🚑' },
]

export default function OnboardingModal({ mode, onClose, onDone }: Props) {
  const { signUp, updateProfile } = useAuth()

  const [step, setStep] = useState<RegisterStep | CompleteStep>(mode === 'register' ? 'account' : 'experience')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [experience, setExperience] = useState<ExperienceLevel | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmSent, setConfirmSent] = useState(false)

  const steps: (RegisterStep | CompleteStep)[] = mode === 'register' ? ['account', 'experience', 'path'] : ['experience', 'path']
  const stepIdx = steps.indexOf(step)

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim()) { setError('Bitte gib einen Nutzernamen ein.'); return }
    setError(null)
    setStep('experience')
  }

  const handleExperienceNext = () => {
    if (!experience) { setError('Bitte wähle eine Option aus.'); return }
    setError(null)
    setStep('path')
  }

  const finish = async () => {
    setLoading(true)
    setError(null)

    if (mode === 'register') {
      const { error } = await signUp(email, password, username.trim(), experience!, 'standard')
      setLoading(false)
      if (error) { setError(error); setStep('account'); return }
      setConfirmSent(true)
      return
    }

    const { error } = await updateProfile({
      experience_level: experience!,
      learning_path: 'standard',
      onboarding_completed: true,
    })
    setLoading(false)
    if (error) { setError(error); return }
    onDone()
  }

  if (confirmSent) {
    return (
      <div className="modal-overlay">
        <div className="modal-sheet">
          <div className="modal-handle" />
          <div className="modal-title">Fast geschafft! 📬</div>
          <div className="modal-subtitle">
            Wir haben dir eine Bestätigungs-E-Mail geschickt. Bestätige deine Adresse, um dich anzumelden und loszulegen.
          </div>
          <div className="modal-actions">
            <button className="main-btn red" onClick={onDone}>Alles klar</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modal-overlay" onClick={e => step === 'account' && onClose && e.target === e.currentTarget && onClose()}>
      <div className="modal-sheet">
        <div className="modal-handle" />

        <div className="onboarding-dots">
          {steps.map((s, i) => (
            <div key={s} className={`onboarding-dot${i === stepIdx ? ' active' : i < stepIdx ? ' done' : ''}`} />
          ))}
        </div>

        {error && <div className="form-alert error">⚠️ {error}</div>}

        {step === 'account' && (
          <>
            <div className="modal-title">Konto erstellen 🎉</div>
            <div className="modal-subtitle">Starte deine Erste-Hilfe-Reise</div>
            <form onSubmit={handleAccountSubmit}>
              <div className="form-field">
                <label className="form-label">Nutzername</label>
                <input className="form-input" type="text" placeholder="Dein Nutzername" value={username} onChange={e => setUsername(e.target.value)} required />
              </div>
              <div className="form-field">
                <label className="form-label">E-Mail</label>
                <input className="form-input" type="email" placeholder="deine@email.de" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="form-field">
                <label className="form-label">Passwort</label>
                <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
              </div>
              <div className="modal-actions">
                <button type="submit" className="main-btn red">Weiter</button>
              </div>
            </form>
          </>
        )}

        {step === 'experience' && (
          <>
            <div className="modal-title">Deine Erfahrung 🩺</div>
            <div className="modal-subtitle">Damit wir den Kurs richtig für dich einstellen</div>
            <div className="choice-list">
              {EXPERIENCE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  className={`option-btn${experience === opt.value ? ' selected' : ''}`}
                  onClick={() => { setExperience(opt.value); setError(null) }}
                >
                  <span style={{ fontSize: 24 }}>{opt.emoji}</span>
                  <span>
                    <div style={{ fontWeight: 800 }}>{opt.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>{opt.desc}</div>
                  </span>
                </button>
              ))}
            </div>
            <div className="modal-actions">
              <button type="button" className="main-btn red" onClick={handleExperienceNext} disabled={!experience}>Weiter</button>
            </div>
          </>
        )}

        {step === 'path' && (
          <>
            <div className="modal-title">Dein Lernpfad 🧭</div>
            <div className="modal-subtitle">Wie möchtest du lernen?</div>
            <div className="path-choice-row">
              <button type="button" className="path-choice-btn" disabled={loading} onClick={finish}>
                <span style={{ fontSize: 28 }}>📘</span>
                <div style={{ fontWeight: 800 }}>Standard</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>Der klassische Kurs</div>
              </button>
              <button type="button" className="path-choice-btn disabled" disabled>
                <span style={{ fontSize: 28 }}>✨</span>
                <div style={{ fontWeight: 800 }}>Personalisiert</div>
                <span className="path-choice-badge">Demnächst verfügbar</span>
              </button>
            </div>
            {loading && <div className="modal-subtitle" style={{ marginTop: 12, textAlign: 'center' }}>Konto wird erstellt...</div>}
          </>
        )}
      </div>
    </div>
  )
}
