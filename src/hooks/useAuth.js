import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function toEmail(usernameOrEmail) {
  if (usernameOrEmail.includes('@')) return usernameOrEmail
  return `${usernameOrEmail.toLowerCase()}@apartment-searcher.local`
}

export function useAuth() {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user.id)
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(userId) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
    setLoading(false)
  }

  async function signUp(username, password) {
    const { error } = await supabase.auth.signUp({
      email: toEmail(username),
      password,
      options: { data: { display_name: username } },
    })
    if (error) {
      if (error.message.toLowerCase().includes('already registered')) {
        throw new Error('Username already taken')
      }
      throw error
    }
  }

  async function signIn(username, password) {
    const { error } = await supabase.auth.signInWithPassword({
      email: toEmail(username),
      password,
    })
    if (error) throw error
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return { user, profile, loading, signUp, signIn, signOut }
}
