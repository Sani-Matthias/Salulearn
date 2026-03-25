import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase, isSupabaseConfigured, type Profile } from '../lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  isOnlineMode: boolean
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signInWithGoogle: () => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>
  refreshProfile: () => Promise<void>
  resendConfirmationEmail: (email: string) => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const isOnlineMode = isSupabaseConfigured()

  // Fetch user profile from database
  const fetchProfile = useCallback(async (userId: string) => {
    if (!supabase) return null

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error)
      return null
    }

    return data as Profile
  }, [])

  // Create profile for new user
  const createProfile = useCallback(async (user: User, displayName?: string) => {
    if (!supabase) return null

    const newProfile = {
      id: user.id,
      email: user.email || '',
      display_name: displayName || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      avatar_url: user.user_metadata?.avatar_url || null,
    }

    const { data, error } = await supabase
      .from('profiles')
      .upsert(newProfile)
      .select()
      .single()

    if (error) {
      console.error('Error creating profile:', error)
      return null
    }

    return data as Profile
  }, [])

  // Initialize auth state
  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(true)


      if (session?.user) {
        let userProfile = await fetchProfile(session.user.id)
        if (!userProfile && event === 'SIGNED_IN') {
          userProfile = await createProfile(session.user)
        }
        setProfile(userProfile)
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [fetchProfile, createProfile])

  // Sign up with email and password
  const signUp = async (email: string, password: string, displayName: string) => {
    if (!supabase) {
      return { error: 'Supabase nicht konfiguriert. Bitte .env Datei pruefen.' }
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: displayName,
        },
      },
    })

    if (error) {
      return { error: translateError(error.message) }
    }

    return { error: null }
  }

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: 'Supabase nicht konfiguriert. Bitte .env Datei pruefen.' }
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return { error: translateError(error.message) }
    }

    return { error: null }
  }

  // Sign in with Google
  const signInWithGoogle = async () => {
    if (!supabase) {
      return { error: 'Supabase nicht konfiguriert. Bitte .env Datei pruefen.' }
    }
    console.log("Attempting Google Sign in")
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google'
    })

    if (error) {
      console.error("Google Sign in Error:", error)
      return { error: translateError(error.message) }
    }

    return { error: null }
  }

  // Sign out
  const signOut = async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
    setSession(null)
  }

  // Reset password
  const resetPassword = async (email: string) => {
    if (!supabase) {
      return { error: 'Supabase nicht konfiguriert. Bitte .env Datei pruefen.' }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      return { error: translateError(error.message) }
    }

    return { error: null }
  }
  
  // Resend confirmation email
  const resendConfirmationEmail = async (email: string) => {
    if (!supabase) {
      return { error: 'Supabase nicht konfiguriert. Bitte .env Datei pruefen.' };
    }

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
    });

    if (error) {
      return { error: translateError(error.message) };
    }

    return { error: null };
  };

  // Update profile
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!supabase || !user) {
      return { error: 'Nicht angemeldet.' }
    }

    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (error) {
      return { error: translateError(error.message) }
    }

    // Refresh profile
    const updatedProfile = await fetchProfile(user.id)
    setProfile(updatedProfile)

    return { error: null }
  }

  // Update password
  const updatePassword = async (newPassword: string) => {
    if (!supabase) {
      return { error: 'Supabase nicht konfiguriert.' }
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      return { error: translateError(error.message) }
    }

    return { error: null }
  }

  // Refresh profile data
  const refreshProfile = async () => {
    if (user) {
      const updatedProfile = await fetchProfile(user.id)
      setProfile(updatedProfile)
    }
  }

  const value = {
    user,
    profile,
    session,
    loading,
    isOnlineMode,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
    updateProfile,
    updatePassword,
    refreshProfile,
    resendConfirmationEmail,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Translate common Supabase errors to German
function translateError(message: string): string {
  const translations: Record<string, string> = {
    'Invalid login credentials': 'Ungueltige Anmeldedaten. Bitte ueberpruefen.',
    'Email not confirmed': 'E-Mail noch nicht bestaetigt. Bitte pruefe dein Postfach.',
    'User already registered': 'Diese E-Mail ist bereits registriert.',
    'Password should be at least 6 characters': 'Passwort muss mindestens 6 Zeichen haben.',
    'Unable to validate email address: invalid format': 'Ungueltige E-Mail-Adresse.',
    'Email rate limit exceeded': 'Zu viele Anfragen. Bitte warte einen Moment.',
  }

  return translations[message] || message
}
