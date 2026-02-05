"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
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

  const supabase = getSupabaseClient()

  // Fetch the user's TaxEngine profile (or create one if it doesn't exist)
  const fetchProfile = useCallback(async (userId: string, userEmail?: string) => {
    setIsProfileLoading(true)
    try {
      const { data, error } = await supabase
        .from('TaxEngineUsers')
        .select('*')
        .eq('uuid', userId)
        .single()

      if (error) {
        // PGRST116 = "No rows found" - user profile doesn't exist yet
        if (error.code === 'PGRST116' && userEmail) {
          console.log('Profile not found, creating new profile for user:', userId)
          
          // Auto-create the profile
          const { data: newProfile, error: insertError } = await supabase
            .from('TaxEngineUsers')
            .insert({
              uuid: userId,
              email: userEmail,
              role: 'CLAIM_PROCESSOR',
              status: 'ACTIVE',
            })
            .select()
            .single()

          if (insertError) {
            console.error('Error creating profile:', insertError.message, insertError.code, insertError.details)
            return null
          }

          setProfile(newProfile)
          return newProfile
        }

        // Log the actual error details
        console.error('Error fetching profile:', error.message, error.code, error.details)
        return null
      }
      setProfile(data)
      return data
    } catch (err) {
      console.error('Error fetching profile:', err)
      return null
    } finally {
      setIsProfileLoading(false)
    }
  }, [supabase])

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession()
        setSession(initialSession)
        setUser(initialSession?.user ?? null)

        // Fetch profile if user exists
        if (initialSession?.user) {
          await fetchProfile(initialSession.user.id, initialSession.user.email)
        }
      } catch (err) {
        console.error('Error initializing auth:', err)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession)
        setUser(newSession?.user ?? null)

        if (event === 'SIGNED_IN' && newSession?.user) {
          await fetchProfile(newSession.user.id, newSession.user.email)
        } else if (event === 'SIGNED_OUT') {
          setProfile(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, fetchProfile])

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

      // Update last login in profile
      if (data.user) {
        await supabase
          .from('TaxEngineUsers')
          .update({ lastLoginAt: new Date().toISOString() })
          .eq('uuid', data.user.id)
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
