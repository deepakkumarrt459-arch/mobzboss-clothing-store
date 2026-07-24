'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/components/ui/context/AuthContext'
import { getUser } from '@/services/userService'
import type { UserProfile } from '@/types/user'

export function useUser() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const userId = useMemo(() => user?.uid, [user])

  useEffect(() => {
    if (!userId) {
      void Promise.resolve().then(() => {
        setProfile(null)
        setLoading(false)
      })
      return
    }

    let cancelled = false

    const loadUser = async () => {
      setLoading(true)

      try {
        const fetchedUser = await getUser(userId)
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

    void loadUser()

    return () => {
      cancelled = true
    }
  }, [userId])

  return {
    profile,
    loading,
    refresh: async () => {
      if (!userId) {
        setProfile(null)
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        setProfile(await getUser(userId))
      } catch (error) {
        console.error('Failed to refresh user profile', error)
      } finally {
        setLoading(false)
      }
    },
  }
}
