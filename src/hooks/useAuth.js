import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)   // { plan, display_name, ... }
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  // Fetch user profile + plan from DB
  const fetchProfile = useCallback(async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (!error && data) setProfile(data)
  }, [])

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      setLoading(false)
    })
    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const signUp = async (email, password, displayName) => {
    setError(null)
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { display_name: displayName } },
    })
    if (error) { setError(error.message); return { error } }
    return { data }
  }

  const signIn = async (email, password) => {
    setError(null)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError(error.message); return { error } }
    return { data }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null); setProfile(null)
  }

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    return { error }
  }

  // Derived plan — falls back to 'free' if no profile yet
  const plan = profile?.plan || 'free'
  const isPro = plan === 'pro' || plan === 'family'
  const displayName = profile?.display_name || user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Usuario'

  return {
    user, profile, plan, isPro, displayName,
    loading, error, setError,
    signUp, signIn, signOut, resetPassword,
    refreshProfile: () => user && fetchProfile(user.id),
  }
}
