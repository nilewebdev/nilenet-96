
import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, AuthError } from '@supabase/supabase-js'
import { supabase, Profile } from '@/lib/supabase'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session)
      setUser(session?.user ?? null)
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session)
        setUser(session?.user ?? null)
        if (session?.user) {
          await loadProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId: string) => {
    try {
      console.log('Loading profile for user:', userId)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error)
        // Don't throw here, just create a default profile
      }

      if (data) {
        console.log('Profile loaded:', data)
        setProfile(data)
      } else {
        console.log('Creating default profile')
        // Get current user for email
        const currentUser = await supabase.auth.getUser()
        const userEmail = currentUser.data.user?.email || ''
        
        // Create default profile
        const defaultProfile = {
          id: userId,
          email: userEmail,
          theme: 'nile-default',
          bookmarks: [],
          homepage_layout: null,
          homepage_tiles: [],
          weather_enabled: false,
          browsing_history: [],
          default_search_engine: 'bing',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }

        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert(defaultProfile)
          .select()
          .single()

        if (createError) {
          console.error('Error creating profile:', createError)
          // Set a basic profile even if database insert fails
          setProfile(defaultProfile)
        } else {
          console.log('New profile created:', newProfile)
          setProfile(newProfile)
        }
      }
    } catch (error) {
      console.error('Error in loadProfile:', error)
      // Set basic profile to prevent auth flow from breaking
      const currentUser = await supabase.auth.getUser()
      const userEmail = currentUser.data.user?.email || ''
      setProfile({
        id: userId,
        email: userEmail,
        theme: 'nile-default',
        bookmarks: [],
        homepage_layout: null,
        homepage_tiles: [],
        weather_enabled: false,
        browsing_history: [],
        default_search_engine: 'bing',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string) => {
    console.log('Attempting to sign up with email:', email)
    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      console.log('Sign up response:', { data, error })
      
      if (error) {
        console.error('Sign up error:', error)
        throw error
      }

      // If sign up is successful and user is immediately available (no email confirmation)
      if (data.user && !data.user.email_confirmed_at) {
        console.log('User created but needs email confirmation')
      }
    } catch (error) {
      console.error('Sign up error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('Attempting to sign in with email:', email)
    setLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('Sign in response:', { data, error })
      
      if (error) {
        console.error('Sign in error:', error)
        throw error
      }

      // Auth state change will be handled by the listener
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    console.log('Attempting to sign out')
    setLoading(true)
    
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('Sign out error:', error)
        throw error
      }
      console.log('Sign out successful')
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in')

    console.log('Updating profile with:', updates)
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (error) {
        console.error('Update profile error:', error)
        throw error
      }

      setProfile(prev => prev ? { ...prev, ...updates, updated_at: new Date().toISOString() } : null)
    } catch (error) {
      console.error('Update profile error:', error)
      throw error
    }
  }

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
