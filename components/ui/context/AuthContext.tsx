'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '../../../lib/firebase'
import * as authService from '../../../services/authService'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  logout: () => Promise<void>
  register: (name: string, email: string, password: string) => Promise<User>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string, rememberMe = true) => {
    await authService.login(email, password, rememberMe)
  }

  const logout = async () => {
    await authService.logout()
  }

  const register = async (name: string, email: string, password: string) => {
    return authService.register(name, email, password)
  }

  const resetPassword = async (email: string) => {
    await authService.resetPassword(email)
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      register,
      resetPassword,
    }),
    [user, loading],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
