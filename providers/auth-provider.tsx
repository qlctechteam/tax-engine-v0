"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { AuthUser, AUTH_STORAGE_KEY, DEMO_USER, verifyPassword } from "@/lib/types"

interface AuthContextType {
  currentUser: AuthUser | null
  isAuthLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  // Restore auth state on mount
  useEffect(() => {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY)
    if (storedAuth) {
      try {
        const user = JSON.parse(storedAuth) as AuthUser
        setCurrentUser(user)
      } catch {
        localStorage.removeItem(AUTH_STORAGE_KEY)
      }
    }
    setIsAuthLoading(false)
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800))
    
    // Verify credentials
    if (email.toLowerCase() === DEMO_USER.email && verifyPassword(password, DEMO_USER.passwordHash)) {
      const user: AuthUser = { email: DEMO_USER.email, name: DEMO_USER.name }
      // Persist auth state
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
      setCurrentUser(user)
      return { success: true }
    } else {
      return { success: false, error: "Invalid email or password. Please try again." }
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    setCurrentUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ currentUser, isAuthLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
