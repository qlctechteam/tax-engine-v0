"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { getSupabaseClient } from "@/lib/supabase"
import type { User, Session } from "@supabase/supabase-js"
import type { TaxEngineUser } from "@/lib/supabase/database.types"

interface SupabaseAuthContextType {
  // Supabase auth user
  user: User | null
  session: Session | null
  // TaxEngine user profile from database
  profile: TaxEngineUser | null
  // Loading states
  isLoading: boolean
  isProfileLoading: boolean
  // Auth methods
  signInWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>
  signInWithMicrosoft: () => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string, metadata?: { firstName?: string; lastName?: string }) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined)

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<TaxEngineUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  
  // Track if component is mounted to avoid state updates after unmount
  const isMountedRef = useRef(true)

  const supabase = getSupabaseClient()

  // Fetch the user's TaxEngine profile (or create one if it doesn't exist)
  // This is non-blocking - the app will work even without a profile
  const fetchProfile = useCallback(async (userId: string, userEmail?: string) => {
    if (!isMountedRef.current) return null
    
    setIsProfileLoading(true)
    try {
      console.log('Fetching profile for user:', userId)
      
      const { data, error } = await supabase
        .from('TaxEngineUsers')
        .select('*')
        .eq('uuid', userId)
        .single()

      if (!isMountedRef.current) return null

      if (error) {
        // PGRST116 = "No rows found" - user profile doesn't exist yet
        if (error.code === 'PGRST116' && userEmail) {
          console.log('Profile not found, creating via API for user:', userId)
          
          // Use API route to create profile (uses service_role key to bypass RLS)
          try {
            const response = await fetch('/api/auth/create-profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId, userEmail }),
            })
            
            const result = await response.json()
            
            if (!isMountedRef.current) return null
            
            if (!response.ok) {
              console.error('Error creating profile via API:', result.error)
              return null
            }
            
            console.log('Profile created successfully:', result.profile)
            setProfile(result.profile)
            return result.profile
          } catch (apiError) {
            console.error('Error calling create-profile API:', apiError)
            return null
          }
        }

        // Log the actual error details but don't block the app
        console.error('Error fetching profile:', error.message, error.code, error.details)
        console.warn('Continuing without profile - app will work in degraded mode')
        return null
      }
      
      console.log('Profile fetched successfully:', data)
      setProfile(data)
      return data
    } catch (err) {
      console.error('Error fetching profile:', err)
      console.warn('Continuing without profile - app will work in degraded mode')
      return null
    } finally {
      if (isMountedRef.current) {
        setIsProfileLoading(false)
      }
    }
  }, [supabase])

  // Initialize auth state - only runs once on mount
  useEffect(() => {
    let isCancelled = false
    isMountedRef.current = true

    const initAuth = async () => {
      console.log('Initializing auth...')
      try {
        // Use getUser() to validate the session (getSession() can return stale data)
        const { data: { user: currentUser }, error } = await supabase.auth.getUser()
        
        if (isCancelled) return

        if (error) {
          console.log('No valid session:', error.message)
          setUser(null)
          setSession(null)
          setProfile(null)
          setIsLoading(false)
          return
        }

        if (currentUser) {
          console.log('User found:', currentUser.email)
          // Get the full session
          const { data: { session: currentSession } } = await supabase.auth.getSession()
          
          if (isCancelled) return
          
          setSession(currentSession)
          setUser(currentUser)
          
          // Fetch profile (non-blocking - don't await to avoid holding up the UI)
          fetchProfile(currentUser.id, currentUser.email)
        }
      } catch (err) {
        console.error('Error initializing auth:', err)
      } finally {
        if (!isCancelled) {
          console.log('Auth initialization complete')
          setIsLoading(false)
        }
      }
    }

    initAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (isCancelled) return

        console.log('Auth state change:', event)
        
        setSession(newSession)
        setUser(newSession?.user ?? null)

        // Handle various auth events
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (newSession?.user) {
            // Non-blocking profile fetch
            fetchProfile(newSession.user.id, newSession.user.email)
          }
        } else if (event === 'SIGNED_OUT') {
          setProfile(null)
        }
      }
    )

    return () => {
      isCancelled = true
      isMountedRef.current = false
      subscription.unsubscribe()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array - only run once on mount

  // Sign in with email and password
  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      // Track login via API (updates lastLoginAt and creates audit log)
      if (data.user) {
        try {
          await fetch('/api/auth/track-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: data.user.id,
              userEmail: data.user.email,
            }),
          })
        } catch (trackError) {
          // Don't fail login if tracking fails
          console.error('Failed to track login:', trackError)
        }
      }

      return { success: true }
    } catch (err) {
      return { success: false, error: 'An unexpected error occurred' }
    }
  }, [supabase])

  // Sign in with Google OAuth
  const signInWithGoogle = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err) {
      return { success: false, error: 'An unexpected error occurred' }
    }
  }, [supabase])

  // Sign in with Microsoft OAuth
  const signInWithMicrosoft = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'email profile',
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err) {
      return { success: false, error: 'An unexpected error occurred' }
    }
  }, [supabase])

  // Sign up with email and password
  const signUp = useCallback(async (
    email: string, 
    password: string, 
    metadata?: { firstName?: string; lastName?: string }
  ) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: metadata,
        },
      })

      if (error) {
        return { success: false, error: error.message }
      }

      // Create TaxEngine user profile
      if (data.user) {
        await supabase.from('TaxEngineUsers').insert({
          uuid: data.user.id,
          email: data.user.email!,
          firstName: metadata?.firstName || null,
          lastName: metadata?.lastName || null,
          role: 'CLAIM_PROCESSOR',
          status: 'PENDING_INVITATION',
        })
      }

      return { success: true }
    } catch (err) {
      return { success: false, error: 'An unexpected error occurred' }
    }
  }, [supabase])

  // Sign out
  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }, [supabase])

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      return { success: true }
    } catch (err) {
      return { success: false, error: 'An unexpected error occurred' }
    }
  }, [supabase])

  return (
    <SupabaseAuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isProfileLoading,
        signInWithEmail,
        signInWithGoogle,
        signInWithMicrosoft,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </SupabaseAuthContext.Provider>
  )
}

export function useSupabaseAuth() {
  const context = useContext(SupabaseAuthContext)
  if (context === undefined) {
    throw new Error("useSupabaseAuth must be used within a SupabaseAuthProvider")
  }
  return context
}
