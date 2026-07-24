'use client'

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '../../../lib/firebase'
import * as authService from '../../../services/authService'
import { createUser, getUser, updateUser } from '../../../services/userService'
import type { UserProfile } from '../../../types/user'

interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  role: string | null
  loading: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<User>
  logout: () => Promise<void>
  register: (name: string, email: string, password: string) => Promise<User>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!auth) {
      void Promise.resolve().then(() => setLoading(false))
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(true)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    let cancelled = false

    const loadProfile = async () => {
      if (!user) {
        setProfile(null)
        setLoading(false)
        return
      }

      try {
        let fetchedUser = await getUser(user.uid)

        if (!fetchedUser) {
          const defaultName = user.displayName ?? user.email?.split('@')[0] ?? 'User'
          await createUser({
            id: user.uid,
            name: defaultName,
            email: user.email ?? '',
            role: 'customer',
          })
          fetchedUser = await getUser(user.uid)
        }

        if (fetchedUser && !fetchedUser.role) {
          await updateUser(user.uid, { role: 'customer' })
          fetchedUser.role = 'customer'
        }

        if (!cancelled) {
          setProfile(fetchedUser)
        }
      } catch (error) {
        console.error('Failed to load user profile', error)
        if (!cancelled) {
          setProfile(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadProfile()

    return () => {
      cancelled = true
    }
  }, [user])

  const login = async (email: string, password: string, rememberMe = true) => {
    return authService.login(email, password, rememberMe)
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
      profile,
      role: profile?.role ?? null,
      loading,
      login,
      logout,
      register,
      resetPassword,
    }),
    [user, profile, loading],
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
